import { remoteLog } from "@mahaswami/vc-frontend";
import {uniqueEmailValidation} from "./clients.ts";
import {UserRoles} from "../helpers/constants.ts";
import {getDivisionId, isDivisionAdmin, isLargeAcademy, isOrgAdmin} from "../businessLogic.ts";
import {createUser} from "./users.ts";

export const coachEmailValidation = async (value, allValue) => {
    if (!value) return undefined;
    const currentUserId = allValue?.user_id || null;
    const error = await uniqueEmailValidation(value, currentUserId)
    return error || undefined;
}

export const addDivisionIdForCoach = (params, dataProvider) => {
    if (isLargeAcademy() && isOrgAdmin() && params.data.role === UserRoles.DIVISION_ADMIN) {
        params.data = {...params.data, division_id: getDivisionId()};
    }
    if (isLargeAcademy() && isOrgAdmin() && params.data.role === UserRoles.DIVISION_COACH) {
        params.data = {...params.data, division_id: getDivisionId()};
    }
    if (isLargeAcademy() && isDivisionAdmin() && params.data.role === UserRoles.DIVISION_COACH) {
        params.data = {...params.data, division_id: getDivisionId()};
    }
    if (isLargeAcademy() && isOrgAdmin() && params.data.role === UserRoles.ORG_ADMIN ) {
        //nothing to do here
    }
    return params;
}

export const addUserForCoach = async (params) => {
    const coach = params.data;
    if (coach.user_id) return params;
    let derivedRole = isDivisionAdmin() ? UserRoles.DIVISION_COACH : coach.role;
    try {
        const user = await createUser({
            first_name: coach.first_name,
            last_name: coach.last_name,
            email: coach.email,
            role: derivedRole,
            is_active: true
        })
        coach.user_id = user.id;
        coach.first_name = undefined;
        coach.last_name = undefined;
        coach.email = undefined;
        coach.role = undefined;
    } catch (error) {
        console.error("Error creating user for coach:", error);
    } finally {
        return params;
    }
}

export const beforeUpdateCoach = async (params) => {
    try {
        const { user } = params.data;
        const dataProvider = window.swanAppFunctions.dataProvider;
        await dataProvider.update("users", {
            id: user.id,
            data: { first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, is_active: user.is_active }
        })
        return params;
    } catch (error) {
        console.error("Failed to execute before update coach: ", error)
        remoteLog("Error sending on beforeUpdateCoach: ", error);
    }
}

export const filterCoachesAndAdminsByDivisionId = async (params, dataProvider) => {
    if (isLargeAcademy() && isOrgAdmin() && !getDivisionId()) {
        params.filter = {...params.filter, division_id_eq: null};
    }
    if (isLargeAcademy() && isOrgAdmin() && getDivisionId()) {
        params.filter = {...params.filter, division_id_eq: getDivisionId()};
    }
    if (isLargeAcademy() && isDivisionAdmin()) {
        params.filter = {...params.filter, division_id_eq: getDivisionId()};
    }
    return params;
}

export async function getAllCoaches(dataProvider) {
    try {
        const { data: coaches } = await dataProvider.getList('coaches', {
            pagination: { page: 1, perPage: 1000 }
        });
        return coaches;
    } catch (error) {
        console.error("Error on getAllCoaches: ", error);
        remoteLog("Error on getAllCoaches: ", error);
    }
}