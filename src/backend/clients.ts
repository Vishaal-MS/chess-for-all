import { remoteLog } from "@mahaswami/vc-frontend";
import { getDivisionId, isLargeAcademy } from "../businessLogic.ts";
import { ClientTypes } from "../helpers/constants.ts";
import {DataProvider} from "react-admin";

export async function getAllClients(dataProvider: DataProvider) {
    try {
        const {data: clients} = await dataProvider.getList('clients', {
            pagination: { page: 1, perPage: 1000 },
        });
        return clients;
    } catch (error) {
        remoteLog("Error sending on getAllClients: ", error);
    }
}

export async function getActiveClientsCount(dataProvider: DataProvider) {
    try {
        const {data: classes} = await dataProvider.getList('classes', {
            pagination: { page: 1, perPage: 1000 },
        });
        const classIds = classes.map(classRecord => classRecord.id);
        const {data: enrollments} = await dataProvider.getList('enrollments', {
            filter: {class_id: classIds},
            pagination: { page: 1, perPage: 1000 },
        });
        const studentIds = new Set(enrollments.map(enrollment => enrollment.student_id));
        if(studentIds.size === 0) return "0";
        const {data:clients} = await dataProvider.getList('clients', {
            filter: {id: Array.from(studentIds)},
            pagination: { page: 1, perPage: 1000 },
        });
        const activeClients = new Set(clients.map(client => client.id));
        return activeClients;
    } catch (error) {
        remoteLog("Error sending on getActiveClientsCount: ", error);
    }
}

export const afterGetOneClient = async (result: any) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const data = result.data;
        const {data : clientType} = await dataProvider.getOne('client_types', {id: data.client_type_id});
        if(clientType.name === ClientTypes.INDIVIDUAL) {
            const {data: students} = await dataProvider.getList('students', {
                filter: {client_id: data.id},
                meta: {prefetch: ['users']}
            });
            const student = students[0];
            result.data = {...data, student: student};
        }
        return result
    } catch (error) {
        remoteLog("Error sending on afterGetOneClient: ", error);
    }
}

export const afterCreateClient = async (response: any) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const { meta } = response.params;
        const clientData = response.data;
        const {data: clientType} = await dataProvider.getOne('client_types', {id: clientData.client_type_id})
        if(clientType.name === ClientTypes.INDIVIDUAL) {
            let student = meta.student;
            if (isLargeAcademy()) {
                student = {...student, division_id: getDivisionId()};
            }
            student = {...student, client_id : clientData.id}
            await dataProvider.create('students', { data: student })
        }
        const { client_type, ...newData } = clientData
        response.data = newData;
        return response;
    } catch (error) {
        remoteLog("Error sending on afterCreateClient: ", error);
    }
}


export const beforeUpdateClient = async (params: any) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const clientData = params.data;
        const {data : clientType} = await dataProvider.getOne('client_types', {id: clientData.client_type_id});
        if( clientType.name === ClientTypes.INDIVIDUAL) {
            const student = clientData.student;
            await dataProvider.update('students', {id: student.id, data: {...student}})
        }
        clientData.division = undefined;
        clientData.standard = undefined;
        return params;
    } catch (error) {
        remoteLog("Error sending on afterUpdateClient: ", error);
    }
}

export const uniqueEmailValidation = async (email, currentUserId) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const { data: userData } = await dataProvider.getList('users', {
            meta: { scopingEscapeHatch: true },
            pagination: { page: 1, perPage: 100000 }
        });
        const emailLower = email?.toLowerCase();
        const duplicate = userData.find(user => {
            const userEmail = user.email?.toLowerCase();
            return userEmail === emailLower && currentUserId !== user.id;
        });
        if (duplicate) {
            return "This email already exists.";
        }
        return null;
    } catch (error) {
        remoteLog("Error sending on uniqueEmailValidation: ", error);
    }
};

export const studentEmailValidation = async (value: any, allValues: any) => {
    if (!value) return undefined;
    const currentUserId = allValues.student ? allValues.student.user_id : allValues.user_id;
    const error = await uniqueEmailValidation(value, currentUserId);
    return error || undefined;
}

export const parentEmailValidation  = async (value: any, allValues: any) => {
    if (!value) return undefined;
    const currentUserId = allValues.student ? allValues.student.parent_user_id : allValues.parent_user_id;
    const error = await uniqueEmailValidation(value, currentUserId);
    return error || undefined;
}

export const getClassIdByStudentId = async(studentId: number) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const {data: enrollments} = await dataProvider.getList("enrollments", { 
            filter: {student_id : studentId},
            pagination: {page: 1, perPage: 1000}
        });
        const classIds = enrollments?.map(e => e.class_id);
        return classIds;
    } catch(error) {
        remoteLog("Error sending getClassesForCoachByStatus: ", error);
    }
}