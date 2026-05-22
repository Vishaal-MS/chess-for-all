import {getLocalStorage, remoteLog, swanAPI} from "@mahaswami/vc-frontend";
import {EPOCHE_ZERO_DATE, TenantConfigNames, TenantTypes, UserRoles, UserStatus} from "../helpers/constants.ts";
import {getEmailsBasedOnEnv} from "../configuration.tsx";

export const getRole = () => {
    return getLocalStorage('role');
}

export const getUserId = () => {
    return (JSON.parse(getLocalStorage("user")).id)
}

export const isDivisionAdmin = () => {
    return getRole() === UserRoles.DIVISION_ADMIN;
}

export const isDivisionCoach = () => {
    return getRole() === UserRoles.DIVISION_COACH;
}

export const isSuperAdmin = () => {
    return getRole() === UserRoles.SUPER_ADMIN;
}

export const getStudentId = () => {
    return getLocalStorage("student_id");
}

export const getUserFullName = () => {
    return (JSON.parse(getLocalStorage("user")).fullName)
}

export const getUserEmail = () => {
    return getLocalStorage("user_email")
}

export const isProCoach = () => {
    return getRole() === UserRoles.PRO_COACH || getRole() === UserRoles.PRO_COACH_PLUS;
}

export const isProCoachByTenantId = async (tenantId: number) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const { data: settings } = await dataProvider.getList('settings', {
        filter: { tenant_id: tenantId, config_name: 'tenant_type' }
    });
    const tenantConfigValue = Number(settings[0].config_value);
    return tenantConfigValue === 1;
}

export const isOrgCoach = () => {
    return getRole() === UserRoles.ORG_COACH || getRole() === UserRoles.DIVISION_COACH;
}

export const isOrgAdmin = () => {
    return getRole() === UserRoles.ORG_ADMIN;
}

export const isStudent = () => {
    return getRole() === UserRoles.STUDENT;
}

export const currentTenantId = () => {
    return getLocalStorage('tenant_id');
}
export const addDivisionId = (params, dataProvider) => {
    if (isLargeAcademy()) {
        params.data = {...params.data, division_id: getDivisionId()};
    } else {
        params.data = {...params.data, division_id: null};
    }
    return params;
}

export const getParentId = () => {
    return (JSON.parse(getLocalStorage("user")).id)
}

export const isParent = () => {
    return getRole() === UserRoles.PARENT;
}
export const isAcademy = () => {
    const academy_type = getLocalStorage("tenant_academy_type");
    return academy_type === TenantTypes.COACHING_ORG;
}

export const isSchoolStandardLinked = () => {
    const schoolStandardLinking = getLocalStorage("tenant_school_standard_linked");
    return schoolStandardLinking?.toUpperCase() === 'TRUE'
}

export const isRegularSchoolFlavored = () => {
    const schoolFlavouredName = getLocalStorage("tenant_regular_school_flavored");
    return schoolFlavouredName?.toUpperCase() === 'TRUE'
}

export const isExecutiveCoachingFlavored = () => {
    const executiveCoachingFlavoured = getLocalStorage("tenant_executive_coaching_flavored");
    return executiveCoachingFlavoured?.toUpperCase() === 'TRUE'
}

export const getStandardId = () => {
    const standardId = getLocalStorage("tenant_school_standard_id") || "";
    return parseInt(standardId);
}

export const isAnySchoolFlavorActive = () => {
    return isSchoolStandardLinked() || isRegularSchoolFlavored() || isExecutiveCoachingFlavored();
};

export const isCoach = () => {
    return isProCoach() || isOrgCoach() || isOrgAdmin() || isDivisionAdmin();
}

export const getTenantName = () => {
    return getLocalStorage("tenant_name");
}

export const filterByDivisionId = async (params) => {
    let newParams = params;
    if(!newParams) {
        newParams = {};
    }
    if (!isLargeAcademy()) return newParams;
    if (newParams.meta?.scopingEscapeDivision) return newParams;
    const divisionId = await getDivisionId();
    newParams.filter = {...newParams.filter, division_id: divisionId};
    return newParams;
}

export const isLargeAcademy = () => {
    const largeAcademy = getLocalStorage("tenant_large_academy");
    return largeAcademy?.toUpperCase() === 'TRUE';
}

export const getDivisionId = () => {
    const selectedDivisionId = getLocalStorage("selected_division_id");
    return parseInt(selectedDivisionId) || undefined;
}

export const isAllowPublishing = () => {
    const allowPublishing = getLocalStorage("tenant_allowed_publishing");
    return allowPublishing?.toUpperCase() === 'TRUE';
}

export const isAllowedVoiceOver = () => {
    const largeAcademy = getLocalStorage("tenant_allowed_voice_over");
    return largeAcademy?.toUpperCase() === 'TRUE';
}

export const getTenantCountry = () => {
    return getLocalStorage("country");
}
export const isIndianTenant = () => {
    const country = getTenantCountry();
    const isIndia = ['in','ind','india'].includes(country?.toLowerCase());
    return isIndia;
}

export const getGoogleCalendarId = async (dataProvider) => {
    try {
        const {data: settings} = await dataProvider.getList('settings', {filter:{tenant_id: currentTenantId(), config_name: TenantConfigNames.GOOGLE_CALENDER_ID}});
        return settings?.[0]?.config_value;
    } catch (error) {
        remoteLog("Error sending on getGoogleCalendarId: ", error);
    }
}

export const getTeachingModes = async (dataProvider: any) => {
    try {
        const {data: teachingModes} = await dataProvider.getList('teaching_modes', {
            pagination: {page: 1, perPage: 1000},
            meta: {scopingEscapeHatch: true}
        });
        return teachingModes;
    } catch (error) {
        remoteLog("Error sending on getTeachingModes: ", error);
    }
}

export const isShowLargeAcademyMenus = () => {
    return isLargeAcademy() && getDivisionId() !== undefined || !isLargeAcademy() ;
}

export const isTenantAllowedCoaching = () => {
    const tenantAllowedCoaching = getLocalStorage('tenant_allowed_coaching');
    if (tenantAllowedCoaching) {
        return tenantAllowedCoaching.toLowerCase() === "true";
    }
    return false;
}

export const addEscapeTenantScoping = (result) => {
    result.meta = {...result.meta, scopingEscapeHatch: true};
    return result;
}

export const sortByCode = (result) => {
    result.sort = {field: 'code', order: 'ASC'};
    return result;
}

export const sendEmail = async (emailBody: any) => {
    const is_mail_blocked = getLocalStorage('is_mail_blocked');
    if (is_mail_blocked) return
    try {
        const { senderEmail, supportTeamEmail } = getEmailsBasedOnEnv();
        const TENANT_NAME = getLocalStorage("tenant_name");
        let baseBody = {
            from: senderEmail,
            senderName: TENANT_NAME,
        };
        const combinedBody = {...baseBody, ...emailBody}

        const bccList = Array.isArray(emailBody.bcc) ? [supportTeamEmail, ...emailBody.bcc]
            : emailBody.bcc ? [supportTeamEmail, emailBody.bcc] : [];
        const shrunkBccList = bccList.filter(Boolean)
        if (shrunkBccList.length > 0 ) {
            combinedBody.bcc = shrunkBccList.join(',')
        }
        await swanAPI("send_email", combinedBody);
    } catch (error) {
        console.error("Failed to sendEmail: ", error);
        remoteLog("Error sending on sendEmail: ", error);
    }
}

export const changeLastLoginDateAndIsActiveForStudent = async (user: any) => {
    if (user.status === UserStatus.ACTIVE) {
        return {is_active: true, last_login_date: user.last_login_date};
    } else if (user.status === UserStatus.PENDING) {
        return {is_active: true, last_login_date: null}
    } else {
        const lastLoginDate = user.last_login_date ? user.last_login_date : EPOCHE_ZERO_DATE;
        return {is_active: false, last_login_date: lastLoginDate}
    }
}

export const checkFilterValues = async (params, dataProvider) => {
    let newParams = { ...params };
    newParams.filter = { ...newParams.filter };
    for (const key in newParams.filter) {
        const value = newParams.filter[key];
        if (Array.isArray(value) && value.length === 0) {
            newParams.filter[key] = [null];
        }
    }
    return newParams;
};

export const parseToUTCDate = (record: any) => {
    for (const key in record) {
        let value = record[key];
        if (!value) continue;
        if (key.endsWith("_date")) {
            const isoDateString = new Date(value).toISOString();
            const isUTCDateAtMidnight = isoDateString.endsWith("T00:00:00.000Z");
            if (isUTCDateAtMidnight && isoDateString !== EPOCHE_ZERO_DATE) {
                const localMidnight = new Date(value).getTime();
                const localTimezoneOffset = new Date().getTimezoneOffset();
                // Manual offset based on timezone localmidnight (mili sec) + getTimezoneOffset (mili sec) * 60000
                value = new Date(localMidnight + localTimezoneOffset * 60000);
            } else {
                value = isoDateString;
            }
        } else if (key.endsWith("_timestamp") || key === "timestamp") {
            value = new Date(value).toISOString().split("T")[0];
            const now = new Date();
            const utcHours = now.getUTCHours().toString().padStart(2, '0');
            const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
            const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
            value = `${value}T${utcHours}:${utcMinutes}:${utcSeconds}.000Z`;
        }
        record[key] = value;
    }
    return record;
}