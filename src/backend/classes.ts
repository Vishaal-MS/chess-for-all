import {getStudentsForClient} from "./students";
import {getEnrollmentsForStudents} from "./enrollments";
import {parseTime} from "../utils.ts";
import {ClassesStatus, TeachingMode} from "../helpers/constants.ts";
import {studentEnrolledEmail} from "../views/class/create/Create.tsx";
import {differenceInDays, isBefore, parseISO, startOfToday } from "date-fns";
import {getLocalStorage, remoteLog, removeLocalStorage} from "@mahaswami/vc-frontend";
import {isOrgCoach} from "./common_logics.ts";
import {getCurrentUserCoachId} from "./coaches.ts";

export async function getClassesForCoachByStatus(dataProvider,currentCoachId,status) {
    try {
        const {data: classes} = await dataProvider.getList('classes', {
            filter: {coach_id: currentCoachId, status: status},
            pagination: { page: 1, perPage: 1000 },
        });
        return classes;
    } catch(error) {
        remoteLog("Error sending getClassesForCoachByStatus: ", error);
    }
}

export async function getClassesForCoach(dataProvider,currentCoachId) {
    try {
        const {data: classes} = await dataProvider.getList('classes', {
            filter: {coach_id: currentCoachId},
            pagination: { page: 1, perPage: 1000 },
        });
        return classes;
    } catch(error) {
        remoteLog("Error sending getClassesForCoach: ", error);
    }
}

export async function  getAllClassesForTenant(dataProvider) {
    try {
        const {data: classes} = await dataProvider.getList('classes', {
            sort: {field: 'id', order: 'ASC'},
            pagination: { page: 1, perPage: 1000 },
        });
        return classes;
    } catch(error) {
        remoteLog("Error sending getAllClassesForTenant: ", error);
    }
}

export async function updateDiscussionReadStatus(dataProvider, topicId, currentUserId) {
    try {
        const { data: readStatus } = await dataProvider.getList("discussion_read_status", {
            filter: { discussion_topic_id: topicId, user_id: currentUserId },
            pagination: { page: 1, perPage: 1000 },
        });
        await Promise.all(
            readStatus.map(readStatus =>
                dataProvider.update("discussion_read_status", {
                    id: readStatus.id,
                    data: {
                        ...readStatus,
                        is_read: true, read_date: new Date()
                    }
                })
            )
        );
    } catch(error) {
         remoteLog("Error sending update discussionReadStatus:", error)
    }
}

export async function deleteClassAndRelationships(dataProvider, classId, deleteOne) {
    try {
        const { data: classProgresses } = await dataProvider.getList('class_progress', {
            filter: { class_id: classId }
        });
        const { data: classStudents } = await dataProvider.getList('enrollments', {
            filter: { class_id: classId }
        });
        const {data: classSchedules} = await dataProvider.getList('class_schedules', {
            filter: { class_id: classId }
        });
        const classProgressIds = classProgresses.map(classProgress => classProgress.id);
        const classStudentIds = classStudents.map(student => student.id);
        const classScheduleIds = classSchedules.map(schedule => schedule.id);

        await dataProvider.deleteMany('class_progress', {ids: [...classProgressIds]})
        await dataProvider.deleteMany('enrollments', {ids: [...classStudentIds]})
        await dataProvider.deleteMany('class_schedules', {ids: [...classScheduleIds]})
        await deleteOne('classes', { id: classId });
    } catch(error) {
        remoteLog("Error sending deleteClassAndRelationships: ", error)
    }
}

export async function getSubscribedCurriculumIds(dataProvider) {
    try {
        const { data: subscriptions } = await dataProvider.getList('subscriptions', {
            pagination: { page: 1, perPage: 1000 },
            meta: {prefetch: ["subscribables"]}
        });
        const curriculunmIds = subscriptions.map(subscription => subscription.subscribable.curriculum_id);
        return curriculunmIds
    } catch (error) {
        remoteLog("Error sending getSubscribedCurriculumsAndIds: ", error);
    }
}

export async function getOwnAndSubscribedLessonIds(dataProvider, subscribedCurriculumIds, isSchoolClass) {
    try {
        let ownLessonIds = [];
        const { data: ownLessons } = await dataProvider.getList('lessons', {
            pagination: {page: 1, perPage: 1000}
        });
        ownLessonIds = ownLessons.map(ownLesson => ownLesson.id);
        const { data: subscribedLessons } = await dataProvider.getList('curriculum_lessons', {
            filter: { curriculum_id: subscribedCurriculumIds },
            meta: { scopingEscapeHatch: true },
            pagination: { page: 1, perPage: 1000 }
        });
        const subscribedLessonIds = subscribedLessons.map(subscribedLesson => subscribedLesson.lesson_id);
        const lessonIds = [...ownLessonIds, ...subscribedLessonIds];
        return lessonIds;
    } catch (error) {
        console.error("Error sending getOwnAndSubscribedLessonIds: ", error);
        remoteLog("Error sending getOwnAndSubscribedLessonIds: ", error);
    }
}

export async function getExistLessonIds(dataProvider, classId, curriculumId) {
    try {
        let existLessonIds = [];
        let lessonCount = 0;

        if (classId) {
            const {data: classProgress} = await dataProvider.getList('class_progress', {
                filter: {class_id: classId}
            });
            lessonCount = classProgress.length;
            existLessonIds = classProgress.map(progress => progress.lesson_id);
        }
        if (curriculumId) {
            const {data: curriculumLessons} = await dataProvider.getList('curriculum_lessons', {
                filter: {curriculum_id: curriculumId}
            });
            lessonCount = curriculumLessons.length;
            existLessonIds = curriculumLessons.map(curriculumLesson => curriculumLesson.lesson_id);
        }
        return {
            ids: existLessonIds,
            count: lessonCount
        }
    } catch (error) {
        console.error("Error sending getSubscribedAndLessonIds: ", error);
        remoteLog("Error sending getSubscribedAndLessonIds: ", error);
    }
} 

const createSchedule = async (id, value, dataProvider) => {
    try {
        const data = value;
        const classId = id;
        // transform data
        const { schedule_type_id, start_date, end_date, start_datetime, end_datetime, days, details, timezone, is_google_calendar_enabled } = data;
        const scheduleFormData = { schedule_type_id, start_date, end_date, start_datetime, end_datetime, days, details, timezone,is_google_calendar_enabled };
        scheduleFormData.days = scheduleFormData.days != null && scheduleFormData.schedule_type_id !== 2 ? scheduleFormData.days.join(',') : scheduleFormData.days;
        const transformSchedule = {...scheduleFormData, class_id: classId, time_of_start: parseTime(scheduleFormData.start_datetime), time_of_end: parseTime(scheduleFormData.end_datetime)};

        await dataProvider.create("class_schedules", { data: transformSchedule });
    } catch (error) {
        console.error("Failed to create Schedule, ", error);
        remoteLog("Failed to create Schedule, ", error);
    }
}
export const getEnrollmentStudentAndClassCounts = async (dataProvider: any, classId: number, teachingModes: any) => {
    try {
        const {data: enrollments} = await dataProvider.getList('enrollments', { 
            pagination: {page: 1, perPage: 10000},
            meta: { prefetch: ['classes', 'students']}
        });
        const enrolledStudentIds = enrollments.filter((enrollment: any) => enrollment.class_id === classId)
            .map((enrollment: any) => enrollment.student_id);

        let studentAndClassCounts = [];
        for(const studentId of enrolledStudentIds) {
            let countOfEnrollment = 0;
            const studentEnrollments = enrollments.filter((enrollment: any) => enrollment.student_id === studentId);
            for (const enrollment of studentEnrollments) {
                const teachingMode = teachingModes.find((teachingMode: any) => teachingMode.id === enrollment.class.teaching_mode_id);
                if (teachingMode.name !== TeachingMode.IN_PERSON) {
                    countOfEnrollment++;
                }
            }
            const studentEnrollment = enrollments.find((enrollment: any) => enrollment.student_id === studentId);
            studentAndClassCounts.push({student: studentEnrollment.student, classCount: countOfEnrollment});
        }
        return studentAndClassCounts;
    } catch (error) {
        remoteLog("Error sending on getEnrollmentStudentAndClassCounts: ", error);
    }
}

export const updateClassAndSchedule = async (classId: any, value: any, dataProvider: any, classTeachingMode: any, teachingModes: any, calenderRef: any ) => {
    try {
        if (calenderRef.current && !calenderRef.current?.is_school_class)
            await createSchedule(classId, value, dataProvider);
        const {data: classes} = await dataProvider.update('classes', {id: classId, data: { status: ClassesStatus.SCHEDULED}});
        if(classTeachingMode !== TeachingMode.IN_PERSON) {
            const enrollmentData = await getEnrollmentStudentAndClassCounts(dataProvider, classId, teachingModes);
            await studentEnrolledEmail(enrollmentData, dataProvider, classes.name);
        }
    } catch (error) {
        remoteLog("Error sending on updateClassAndSchedule: ", error);
    }
}

export const classNameValidation = async (value: any, allValues: any) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        if (!value) return undefined;
        const classId = allValues?.id;
        const formattedValue = value?.trim().toLowerCase()
        const {data} = await dataProvider.getList('classes', {
            filter: {status_neq: ClassesStatus.DRAFT},
        });

        const duplicate = data.find(clazz => {
            const className = clazz.name?.toLowerCase();
            return className === formattedValue && clazz.id !== classId;
        });
        if (duplicate)
            return "Class name must be unique";

        return null;
    } catch (error) {
        remoteLog("Error sending on classNameValidation: ", error);
    } 
}

export const validateEndDate = async (value: any, allValues: any) => {
    if (!value) return undefined;
    let startDate = new Date(allValues?.start_date);
    const endDate = new Date(allValues?.end_date);
    startDate.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);
    const totalDays = differenceInDays(endDate, startDate);
    if (startDate && endDate) {
        if (startDate > endDate) {
            return 'End date must be after start date.';
        } else if (totalDays > 180) {
            return 'Date range cannot exceed 6 months (180 days).';
        }
    }
};

export const validateStartDate = async (value: any, allValues: any) => {
    if (!value) return undefined;
    const inputDate = parseISO(value);
    const today = startOfToday();
    const isBeforeToday = isBefore(inputDate, today);

    if (isBeforeToday) {
        return 'Start date must be today or later.';
    }
    return undefined;
}

export const getClassById = async (dataProvider, classId: number) => {
    try {
        const { data: classData } = await dataProvider.getOne('classes', {
            id: classId,
            meta: { prefetch: ['teaching_modes', 'coaches'] }
        });
        return classData;
    } catch (error) {
        remoteLog("Error on getClassById: ", error);
        console.error("Error on getClassById: ", error);
    }
}

export const deleteCascadeClass = async (record,dataProvider,resource) => {
    //Todo Remove this - May not be required in production
    //Delete all enrollments for the class
    try {
        const classId = record.id;
        const {data: enrollments} = await dataProvider.getList('enrollments', {
            filter: {class_id: classId},
            pagination: { page: 1, perPage: 1000 },
        });
        // then, delete them
        await dataProvider.deleteMany('enrollments', { ids: enrollments.map(enrollment => enrollment.id) });
        return record;
        //Delete all class progress for the class
        const {data: class_progress} = await dataProvider.getList('class_progress', {
            filter: {class_id: classId},
            pagination: { page: 1, perPage: 10000 },
        });
        // then, delete them
        await dataProvider.deleteMany('class_progress', { ids: class_progress.map(progress => progress.id) });
    } catch (error) {
        remoteLog("Error sending on deleteCascadeClass: ", error);
    }
}

export const filterByStatus = async (params, dataProvider) => {
    let newParams = params;
    if (!newParams) {
        newParams= {}
    }
    newParams.filter = {...newParams?.filter, status_neq: ClassesStatus.DRAFT }
    return newParams;
}

export const filterByCoachId = async (params, dataProvider) => {
    if (!isOrgCoach()) return params;
    const coachId = await getCurrentUserCoachId(dataProvider);
    params.filter = { ...params.filter , coach_id : coachId };
    return params;
}

export const removeTotalClassesCountAtLogin = (result: any) => {
    const totalClassesAtLogin = getLocalStorage("total_classes_at_login");
    if (totalClassesAtLogin !== undefined && result.status !== ClassesStatus.DRAFT) {
        removeLocalStorage("total_classes_at_login");
    }
    return result;
}