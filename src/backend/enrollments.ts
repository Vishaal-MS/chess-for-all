import { remoteLog } from "@mahaswami/vc-frontend";
import { triggerCalendarEventCreation } from "./classSchedule.ts";
import { getClassById } from "./classes.ts";
import {ClassesStatus, EPOCHE_ZERO_DATE, TeachingMode} from "../helpers/constants.ts";
import {
    getCurrentParentStudent,
    getCurrentUserStudentId,
    getTeachingModes,
    isParent,
    isStudent
} from "../businessLogic.ts";
import {sendEmailToStudentAndParent} from "./students.ts";

export async function getEnrollmentsForStudents(dataProvider, studentIds) {
    try {
        const { data: enrollments } = await dataProvider.getList('enrollments', {
            filter: { student_id: studentIds },
            pagination: { page: 1, perPage: 1000 },
        });
        return enrollments;
    } catch (error) {
        remoteLog("Error sending on getEnrollmentsForStudents: ", error);
    }
}

export async function getRemoteAndHybridClassEnrollments(dataProvider, studentId) {
    try {
        const { data: enrollments }  = await dataProvider.getList('enrollments', {
            filter: { student_id: studentId },
            meta: { prefetch: ['classes'] },
            pagination: { page: 1, perPage: 10000 }
        });
        const teachingModes = await getTeachingModes(dataProvider);
        const studentEnrollments = enrollments.filter((enrollment) => {
            const classTeachingMode = teachingModes.find((teachingMode) => teachingMode.id === enrollment.class.teaching_mode_id);
            return classTeachingMode.name !== TeachingMode.IN_PERSON;
        });
        return studentEnrollments;
    } catch (error) {
        console.error("Error sending on getEnrollmentsForLoginStudent: ", error);
        remoteLog("Error sending on getEnrollmentsForLoginStudent: ", error);
    }
}

export async function getStudentsForClasses(dataProvider, classIds) {
    try {
        const {data: enrollments} = await dataProvider.getList('enrollments', {
            filter: {class_id: classIds},
            sort: {field: 'id', order: 'ASC'},
            pagination: { page: 1, perPage: 1000 },
        });
        const studentIds =new Set(enrollments.map(enrollment => enrollment.student_id));
        return Array.from(studentIds);
    } catch (error) {
        remoteLog("Error sending on getStudentsForClasses: ", error);
    }
}

export async function getEnrollmentsByStatusAndClass(dataProvider, classIds, status) {
    try {
        const {data: enrollments} = await dataProvider.getList('enrollments', {
            filter: {class_id: classIds, status: status},
            pagination: { page: 1, perPage: 1000 },
        });
        const studentIds =new Set(enrollments.map(enrollment => enrollment.student_id));
        return studentIds;
    } catch (error) {
        remoteLog("Error sending on getEnrollmentsByStatusAndClass: ", error);
    }
}

export const afterDeleteEnrollements = async (result, dataProvider, resource) => {
    const resData = result.data.data;
    await afterUpdateEnrollments(resData, dataProvider);
    return result;
}

const afterUpdateEnrollments = async (resData,dataProvider) => {
    try {
        const {data: scheduleData} = await dataProvider.getList('class_schedules', {filter: {class_id: resData.class_id}, pagination: {page: 1, perPage: 10000}});
        if(scheduleData.length > 0) {
            const classId = resData.class_id;
            const classData: any = await getClassById(dataProvider, classId);
            if (classData.status !== 'draft') {
                await triggerCalendarEventCreation(scheduleData[0], classData, "update");
            }
        }
    } catch (error) {
        remoteLog("Error sending on afterUpdateEnrollments: ", error);
    }
}

export const addBusinessLogicForEnrollments = async (response: any) => {
    try {
        const enrollment = response;
        const dataProvider = window.swanAppFunctions.dataProvider;
        const {data: classes} = await dataProvider.getOne('classes', {id: enrollment.class_id, meta: {prefetch: ['teaching_modes']}});
        if (classes.status !== ClassesStatus.DRAFT && classes.teaching_mode.name !== TeachingMode.IN_PERSON) {
            await updateUsersInActiveStatusByCreateEnrollments(enrollment, dataProvider, classes.name);
        }
    } catch (error) {
        remoteLog("Error sending on addBusinessLogicForEnrollments: ", error);
    }
}

export const updateUsersInActiveStatusByCreateEnrollments = async (enrollment: any, dataProvider: any, className: string) => {
    try {
        if (enrollment?.student_id) {
            let countOfEnrollment = await getCountOfStudentsRequiringOnlineAccess(enrollment.student_id, dataProvider);
            const {data: student} = await dataProvider.getOne('students', {id: enrollment.student_id, meta: { prefetch: ["users"]}});
            const userId = student?.user_id;
            const withCredentials = countOfEnrollment === 1;
            const lastLoginDate = student?.user.last_login_date === EPOCHE_ZERO_DATE ? '' : student.user.last_login_date;
            const {data: updatedUser} = await dataProvider.update('users', {
                id: userId,
                data: {is_active: true, last_login_date: lastLoginDate}
            });
            await sendEmailToStudentAndParent(updatedUser, withCredentials, className);
        }
    } catch (err) {
        console.error(err);
        remoteLog("Error sending on updateUsersInActiveStatusByCreateEnrollments: ", err);
    } finally {
        return enrollment;
    }
}

const getCountOfStudentsRequiringOnlineAccess = async (studentId: number, dataProvider: any) => {
    try {
        let countOfEnrollment = 0;
        const {data: enrollments} = await dataProvider.getList('enrollments', {
            filter: {student_id: studentId},
            pagination: {page: 1, perPage: 1000},
            meta: {prefetch: ['classes']}
        });
        const teachingModes = await getTeachingModes(dataProvider);
        for (const enrollment of enrollments) {
            const teachingMode = teachingModes.find((t: any) => t.id === enrollment?.class?.teaching_mode_id).name;
            if (teachingMode !== TeachingMode.IN_PERSON) {
                countOfEnrollment++;
            }
        }
        return countOfEnrollment;
    } catch (error) {
        remoteLog("Error sending on getCountOfStudentsRequiringOnlineAccess: ", error);
    }
}

export const updateUsersInActiveStatusByDeleteEnrollments = async (recordData: any, dataProvider: any) => {
    try {
        const studentId = recordData.data.data.student_id;
        if (studentId) {
            let count = await getCountOfStudentsRequiringOnlineAccess(studentId, dataProvider);
            if (count === 0) {
                const {data: student} = await dataProvider.getOne('students', {id: studentId});
                const userId = student.user_id;
                await dataProvider.update('users', {id: userId, data: {is_active: false}});
            }
        }
    } catch (error) {
        console.error(error);
        remoteLog("Error sending on updateUsersInActiveStatusByDeleteEnrollments: ", error);
    } finally {
        return recordData;
    }
}

export const filterEnrollmentsClassByTeachingMode = async (params) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        if (isStudent() || isParent()) {
            let studentId
            if (isStudent()) {
                studentId = await getCurrentUserStudentId(dataProvider);
                const {data: classes} = await dataProvider.getList('classes', {
                    pagination: {page: 1, perPage: 1000},
                    meta: {prefetch: ['teaching_modes']},
                    filter: {status_neq: ClassesStatus.DRAFT}
                });
                const classIds = classes.filter(clazz => clazz.teaching_mode.name !== TeachingMode.IN_PERSON).map(classData => classData.id);
                params.filter = {...params.filter, student_id: studentId, class_id: classIds}
            } else {
                const student = await getCurrentParentStudent(dataProvider);
                studentId = student[0].id;
                params.filter = {...params.filter, student_id: studentId}
            }
        }
        return params
    } catch (error) {
        remoteLog("Error sending on filterEnrollmentsClassByTeachingMode: ", error);
    }
}

export const afterCreateEnrollments = async (response, dataProvider, resource) => {
    const resData = response.data;
    await afterUpdateEnrollments(resData, dataProvider)
    return response;
}