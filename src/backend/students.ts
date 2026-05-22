import {getSimpleDate} from "../utils.ts";
import {UserRoles} from "../helpers/constants.ts";
import {
    getParentEmailTemplate,
    getStudentEmailTemplateWithCredential,
    getStudentEmailTemplateWithoutCredential
} from "../helpers/emailTemplates.ts";
import {getLocalStorage, remoteLog} from "@mahaswami/vc-frontend";
import {
    changeLastLoginDateAndIsActiveForStudent,
    getParentId,
    getUserId,
    isParent,
    isStudent,
    sendEmail
} from "./common_logics.ts";
import {afterGetMultipleUser, createUser} from "./users.ts";
import {DataProvider} from "react-admin";

export const getDOBDateRange = () => {
    const minDOBDate = new Date();
    minDOBDate.setFullYear(minDOBDate.getFullYear() - 100)
    const minDOBDateStr = getSimpleDate(minDOBDate);
    const maxDOBDate = new Date();
    maxDOBDate.setFullYear(maxDOBDate.getFullYear() - 4)
    const maxDOBDateStr = getSimpleDate(maxDOBDate);
    return { minDOBDateStr, maxDOBDateStr };
}

export const getUnEnrollmentStudents = async (dataProvider, enrollmentStudentIds, classRecord) => {
    try {
        let filter = { 'id_neq_any': enrollmentStudentIds };
        if (classRecord?.is_school_class){
            filter.client_id = classRecord?.client_id;
        }

        const { data: students } = await dataProvider.getList('students', {
            filter: {...filter},
            pagination: { page: 1, perPage: 1000 }
        });
        return students;
    } catch (error) {
        remoteLog('Error on getAllStudents: ', error);
        console.error('Error on getAllStudents: ', error);
    }
}

export async function  getStudentsForClient(dataProvider, clientId) {
    try {
        const {data: students} = await dataProvider.getList('students', {
            filter: {client_id: clientId},
            sort: {field: 'id', order: 'ASC'},
            pagination: { page: 1, perPage: 1000 },
        });
        const studentIds = new Set(students.map(student => student.id));
        return studentIds;
    } catch (error) {
        remoteLog("Error sending on getStudentsForClient: ", error);
    }
}

export const beforeCreateStudentUserAndParentUser = async (params: any) => {
    const { data } =  params;
    if (data?.client_id) {
        const studentUser = data.user;
        const parentUser = data?.parent_user;
        const userData = await createUser({
            first_name: studentUser?.first_name,
            last_name: studentUser?.last_name,
            email: studentUser?.email,
            role: UserRoles.STUDENT,
            is_active: false
        })
        data.user_id = userData.id;
        //Create User Account for Parent
        if (parentUser?.first_name) {
            const parent = await createUser({
                first_name: parentUser.first_name,
                last_name: parentUser.last_name,
                email: parentUser.email,
                role: UserRoles.PARENT,
                is_active: data.is_integrated_parental_engagement
            })
            // TODO: Move this email creation logic to after create of user.
            if (data.is_integrated_parental_engagement) {
                await sendEmailToStudentAndParent(parent, undefined);
            }
            data.parent_user_id = parent ? parent.id : null;
        }
        data.user = undefined;
        data.parent_user = undefined;
    }
    params.data =  data;
    return params;
}

export const populateStudentForIndividualClient = async (result) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const clients = result.data;
        const individualClientsIds = clients
            .filter(client => parseInt(client.client_type_id) === 2)
            .map(client => client.id);
        const { data: students } = await dataProvider.getList('students', {
            fitler: { client_id: individualClientsIds },
            meta: { prefetch: ['users'] }
        });
        const studentMap = {};
        for (const student of students) {
            if (student) {
                studentMap[student.client_id] = student;
            }
        }
        result.data = clients.map(client => {
            if (parseInt(client.client_type_id) === 2 && studentMap[client.id]) {
                return { ...client, student: studentMap[client.id] };
            }
            return client;
        });
        return result;
    } catch (error) {
        remoteLog("Error sending on getStudentsForClient: ", error);
    }
};

export const populateSingleUser = (result) => {
    const record = result.data;
    const { data: populatedUsers } = populateMultipleUser({ data: [record] });
    result.data = populatedUsers[0];
    return result;
}

export const populateMultipleUser = (result) => {
    try {
        const records = result.data;
        const userRecords = records.filter(record => record.user).map(record => record.user);
        if (userRecords.length == 0) return result;
        const { data: populatedUsers } = afterGetMultipleUser({ data: userRecords });
        result.data = records.map(record => {
            const foundUser = populatedUsers.find(user => user.id == record.user_id);
            if (foundUser) {
                return { ...record, user: foundUser };
            }
            return record;
        });
        return result;
    } catch (error) {
        remoteLog("Error sending on populateMultipleUser: ", error);
    }
}

export const getStudentsByClassId = async (dataProvider, classId) => {
    try {
        const { data: enrollments } = await swanDataProvider.getList("enrollments", {
            filter: { class_id: Number(classId) },
            pagination: { page: 1, perPage: 10000 },
            meta: { prefetch: ["students"] }
        })
        const studentIds = enrollments.map(enrollment => enrollment.student_id);
        const { data: students } = await dataProvider.getList("students", {
            filter: { id: studentIds },
            meta: { prefetch: ["users"] },
            pagination :  {page: 1, perPage: 10000}
        })
        return students;
    } catch (error) {
        remoteLog('Error on getStudentsByClassId: ', error);
        console.log('Error on getStudentsByClassId: ', error);
    }
}

export const beforeUpdateStudent = async (params: any) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const data =  params.data;
        let parentUser = data?.parent_user;
        if (parentUser) {
            let parent;
            if (!data.parent_user_id) {
                if (parentUser && parentUser.first_name) {
                    parent = await createUser({
                        first_name: parentUser.first_name,
                        last_name: parentUser.last_name,
                        email: parentUser.email,
                        role: UserRoles.PARENT,
                        is_active: data.is_integrated_parental_engagement
                    })
                    data.parent_user_id = parent ? parent.id : null;
                    if (data.is_integrated_parental_engagement) {
                        await sendEmailToStudentAndParent(parent, undefined);
                    }
                }
            } else {
                const {data: previousParentData} = await dataProvider.getOne('users', {id: data.parent_user_id});
                parent = await dataProvider.update('users', {
                    id: data.parent_user_id,
                    data: {is_active: data.is_integrated_parental_engagement,
                        first_name: parentUser.first_name,
                        last_name: parentUser.last_name,
                        email: parentUser?.email,
                    }
                })
                parent = parent.data;
                if (!previousParentData.is_active && parent.is_active) {
                    await sendEmailToStudentAndParent(parent, undefined);
                }
            }
            params.data = params.data?.student ? {...params.data, student: data} : data;
        }
        const userData = data.user;
        const studentUpdate = await changeLastLoginDateAndIsActiveForStudent(userData);
        await dataProvider.update('users', {
            id: data.user_id,
            data: {
                first_name: userData.first_name,
                last_name: userData.last_name,
                is_active: studentUpdate.is_active,
                last_login_date: studentUpdate.last_login_date,
                email: userData?.email
            }
        })

        return params;
    } catch (error) {
        remoteLog("Error sending on beforeUpdateStudent: ", error);
    }
}

export async function getCurrentUserStudentId(dataProvider) {
    try {
        if(!isStudent()) return;
        if (getLocalStorage('direct_assignment_mode'))
            return getLocalStorage('current_assignment_student_id') || '';
        const {data: students} = await dataProvider.getList('students', {
            filter: {user_id: getUserId()},
            sort: {field: 'id', order: 'ASC'},pagination: { page: 1, perPage: 1000 },
        });
        return students.map(studentRecord => studentRecord.id);
    } catch (error) {
        remoteLog("Error sending on getCurrentUserStudentId: ", error);
    }
}

export async function getCurrentParentStudent(dataProvider: DataProvider) {
    try {
        if (!isParent()) return;
        const { data: students } = await dataProvider.getList('students', {
            filter: { parent_user_id: getParentId() },
            sort: { field: 'id', order: 'ASC' }, pagination: { page: 1, perPage: 1000 },
        });
        return students;
    } catch (error) {
        remoteLog("Error sending on getCurrentParentStudent: ", error);
    }
}

export const sendEmailToStudentAndParent = async (user: any, withCredentials?:boolean, className?: string) => {
    try {
        const userEmail = user.email;
        if (user.is_active) {
            if (user.role === UserRoles.STUDENT) {
                const messageTemplate = withCredentials ?
                    getStudentEmailTemplateWithCredential(user, className)
                    : getStudentEmailTemplateWithoutCredential(user, className);
                await sendEmail({to: userEmail, ...messageTemplate});
            } else if (user.role === UserRoles.PARENT) {
                const messageTemplate = getParentEmailTemplate(user);
                await sendEmail({to: userEmail, ...messageTemplate});
            }
        }
    } catch (error) {
        console.error("Error sending email: ", error);
        remoteLog("Error sending student email:", error)
    }
}