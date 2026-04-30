import {getSimpleDate} from "../utils.ts";
import {UserRoles} from "../helpers/constants.ts";
import {
    getParentEmailTemplate,
    getStudentEmailTemplateWithCredential,
    getStudentEmailTemplateWithoutCredential
} from "../helpers/emailTemplates.ts";
import {remoteLog} from "@mahaswami/vc-frontend";
import {sendEmail} from "../businessLogic.ts";
import {createUser} from "./users.ts";

export const getDOBDateRange = () => {
    const minDOBDate = new Date();
    minDOBDate.setFullYear(minDOBDate.getFullYear() - 100)
    const minDOBDateStr = getSimpleDate(minDOBDate);
    const maxDOBDate = new Date();
    maxDOBDate.setFullYear(maxDOBDate.getFullYear() - 4)
    const maxDOBDateStr = getSimpleDate(maxDOBDate);
    return { minDOBDateStr, maxDOBDateStr };
}

export const beforeCreateStudentUserAndParentUser = async (params: any) => {
    console.log("Student before: ", params)
    const { data, meta } =  params;
    if (data.client_id) {
        console.log("before createUser : ", params)
        const userData = await createUser({
            first_name: meta.studentUser.first_name,
            last_name: meta.studentUser.last_name,
            email: meta.studentUser.email,
            role: UserRoles.STUDENT,
            is_active: false
        })
        console.log("userData 123: ", userData)
        data.user_id = userData.id;
        //Create User Account for Parent
        const parentUser = meta?.parentUser;
        if (parentUser && parentUser.first_name) {
            const parent = await createUser({
                first_name: parentUser.first_name,
                last_name: parentUser.last_name,
                email: parentUser.email,
                role: UserRoles.PARENT,
                is_active: data.is_integrated_parental_engagement
            })
            console.log("parent: ", parent)
            // TODO: Move this email creation logic to after create of user.
            if (data.is_integrated_parental_engagement) {
                await sendEmailToStudentAndParent(parent, undefined);
            }
            data.parent_user_id = parent ? parent.id : null;
        }
//         data.parent_name = parentUser?.fullName;
//         data.parent_email = parentUser?.email;
    }
    params.data =  data;
    return params;
}

export const sendEmailToStudentAndParent = async (user: any, withCredentials?:boolean, className?: string) => {
    try {
        const userEmail = user.email;
        if (user.is_active) {
            if (user.role === UserRoles.STUDENT) {
                const messageTemplate = withCredentials ? getStudentEmailTemplateWithCredential(user, className)
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