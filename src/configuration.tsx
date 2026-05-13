import { getLocalStorage, setLocalStorage, removeLocalStorage, OmniSearchBox, dataProvider as vcDataProvider } from "@mahaswami/vc-frontend";

import appConfigOptions from '../vegacore.json';
export const appTitlePrefix = () => {
    const appTitle = appConfigOptions.title;
    return appTitle;
};

export const canAccess = async (params: any) => {
    //undefined means no override and default behavior based on vegacore.permissions.json configuration
    const tenantId = getLocalStorage('tenant_id');
    if (params.resource === 'lessons' && ['edit'].includes(params.action) && params.record && params.record.tenant_id != tenantId) {
        return false;
    }
    if (params.resource === 'tenants' && ['delete'].includes(params.action)) {
        return false;
    }
    if (params.action === 'hash_tenant' && getLocalStorage("role") !== "super_admin") {
        return false;
    }
    if (
        params.resource === 'timesheets' &&
        ['edit', 'delete'].includes(params.action) &&
        params.record &&
        [UserRoles.ORG_COACH, UserRoles.ORG_ADMIN, UserRoles.DIVISION_ADMIN, UserRoles.DIVISION_COACH].includes(getLocalStorage("role")) &&
        (params?.record?.created_by_user_id !== getUserId() || params.record.is_archived)
    ) {
        return false;
    }
}

export const postLogin = async (dataProvider: any, user: any) => {
    // if (getLocalStorage("role") === "super_admin") {
    //     return;
    // }
    // console.log("Role: ", getLocalStorage("role"));
    // const isStudent = getLocalStorage("role") === "student";
    // const postLoginPromises = [
    //     dataProvider.getList('classes'),
    //     dataProvider.getList('coaches', {filter:{user_id: user.id}}),
    //     dataProvider.getList('settings')
    // ]
    // if (isStudent) {
    //     postLoginPromises.push(vcDataProvider.getList('students', {
    //         filter: {user_id: user.id},
    //         sort: {field: 'id', order: 'ASC'},
    //         pagination: { page: 1, perPage: 1000 },
    //     }));
    // }
    // const [classesResult, coachesResult, settingsResult, studentResult] = await Promise.all(postLoginPromises);
    // const {data: classes} = classesResult;
    // const {data: coaches} = coachesResult;
    // const {data: settings} = settingsResult;
    // console.log("Data: ", classes, coaches, settings, studentResult)
    // if (settings.length > 0) {
    //     const tenantType = settings.find(s => s.config_name === TenantConfigNames.TENANT_TYPE).config_value;
    //     const allowPublishing = settings.find(s => s.config_name === TenantConfigNames.ALLOW_PUBLISHING).config_value;
    //     const allowCoaching = settings.find(s => s.config_name === TenantConfigNames.ALLOW_COACHING).config_value;
    //     const largeAcademy = settings.find(s => s.config_name === TenantConfigNames.LARGE_ACADEMY)?.config_value;
    //     const allowVoiceOver = settings.find(s => s.config_name === TenantConfigNames.ALLOW_VOICE_OVER)?.config_value;
    //     const tenantCountry = settings.find(s => s.config_name === TenantConfigNames.COUNTRY)?.config_value;
    //     const calendarId = settings.find(s => s.config_name === TenantConfigNames.GOOGLE_CALENDER_ID)?.config_value;
    //     const schoolStandardLinked = settings.find(s => s.config_name === TenantConfigNames.SCHOOL_STANDARD_LINKED)?.config_value;
    //     const regularSchoolFlavored = settings.find(s => s.config_name === TenantConfigNames.REGULAR_SCHOOL_FLAVORED)?.config_value;
    //     const executiveCoachingFlavored = settings.find(s => s.config_name === TenantConfigNames.EXECUTIVE_COACHING_FLAVORED)?.config_value;
    //     const schoolStandardId = settings.find(s => s.config_name === TenantConfigNames.SCHOOL_STANDARD_ID)?.config_value;
    //     setLocalStorage('tenant_allowed_publishing', allowPublishing);
    //     setLocalStorage('tenant_allowed_coaching', allowCoaching);
    //     setLocalStorage('tenant_academy_type', TenantTypeLookup[tenantType]);
    //     setLocalStorage('tenant_large_academy', largeAcademy);
    //     setLocalStorage('country', tenantCountry);
    //     setLocalStorage('tenant_google_calendar_id', calendarId);
    //     setLocalStorage('tenant_school_standard_linked', schoolStandardLinked);
    //     setLocalStorage('tenant_regular_school_flavored', regularSchoolFlavored);
    //     setLocalStorage('tenant_executive_coaching_flavored', executiveCoachingFlavored);
    //     setLocalStorage('tenant_school_standard_id', schoolStandardId);
    //     setLocalStorage('tenant_allowed_voice_over', allowVoiceOver);
    //     setLocalStorage('is_app_sound_enabled', true);
    //     if (regularSchoolFlavored?.toUpperCase() === 'TRUE') {
    //         const {data: clients} = await dataProvider.getList('clients');
    //         if (clients.length === 0) {
    //             const tenantName = getLocalStorage('tenant_name');
    //             const standardId = parseInt(schoolStandardId);
    //             await dataProvider.create('clients', {
    //                 data: {
    //                     name: tenantName,
    //                     primary_contact_name: tenantName,
    //                     standard_id: standardId,
    //                     client_type_id: 1
    //                 }
    //             });
    //         }
    //     }
    // }
    // setLocalStorage('coach_id', coaches[0]?.id);
    // if (isDivisionAdmin() || isDivisionCoach()) {
    //     const divisionId = coaches[0]?.division_id;
    //     setLocalStorage('selected_division_id', divisionId);
    // }
    // if (isStudent) {
    //     const {data: students} = studentResult;
    //     const currentStudent = students.find(student => student.user_id === getUserId());
    //     setLocalStorage('student_id', currentStudent.id);
    //     const enrollments = await getRemoteAndHybridClassEnrollments(vcDataProvider, students[0].id);
    //     const activeClassEnrollments = enrollments.filter((enrollment) => enrollment.class.status === ClassesStatus.ACTIVE);
    //     if (enrollments.length === 1) {
    //         const enrollmentId = enrollments[0].id;
    //         setLocalStorage("enrollment_id", enrollmentId);
    //     } else if (activeClassEnrollments.length > 0) {
    //         const enrollmentId = activeClassEnrollments[0].id;
    //         setLocalStorage("enrollment_id", enrollmentId);
    //     }
    // }
    // if (isOrgAdmin() || isProCoach() || isDivisionAdmin()) {
    //     setLocalStorage('total_classes_at_login', classes.length);
    // }
    // if (user.image_file_id) {
    //     const getDownloadURL = () =>
    //         window.data_service_map[window.data_service_name] +
    //         "/file_download/" +
    //         window.spreadsheetId + "/";
    //     user.avatar =
    //         getDownloadURL() + "inline/" + user.image_file_id +
    //         "?app=" + window.app_name + "&env=" + window.app_env;
    //     user.fullName = user.first_name + " " + user.last_name
    //     setLocalStorage('user', JSON.stringify(user));
    // }
}

export const postLogout = () => {
    removeLocalStorage('direct_assignment_mode')
    removeLocalStorage('current_assignment_student_id');
    removeLocalStorage('tenant_allowed_publishing');
    removeLocalStorage('tenant_allowed_coaching');
    removeLocalStorage('tenant_academy_type');
    removeLocalStorage('tenant_allowed_voice_over');
    removeLocalStorage('tenant_large_academy');
    removeLocalStorage('selected_division_id');
    removeLocalStorage('selected_division_name');
    removeLocalStorage('coach_id');
    removeLocalStorage('enrollment_id');
    removeLocalStorage('total_classes_at_login');
    removeLocalStorage('tenant_regular_school_flavored');
    removeLocalStorage('tenant_executive_coaching_flavored');
    removeLocalStorage('tenant_school_standard_linked');
    removeLocalStorage('is_app_sound_enabled');
    removeLocalStorage('class_game_state');
    const keysToRemove = [
        'student_id',
    ]
    keysToRemove.forEach(key => removeLocalStorage(key));
}

export const getSettingsBasedOnEnv = () => {
    let appEnv = window.app_env;
    const currentEnvSettings = appConfigOptions.environments[appEnv as keyof typeof appConfigOptions.environments];
    return currentEnvSettings;
}

export function getEmailsBasedOnEnv() {
    let appEnv = window.app_env;

    const currentEnvSettings = appConfigOptions.environments[appEnv as keyof typeof appConfigOptions.environments];
    let effectiveEmailConfig = currentEnvSettings?.notifications.email;

    return {
        senderEmail: effectiveEmailConfig.senderEmail,
        supportTeamEmail: effectiveEmailConfig.supportTeamEmail,
    };
}

/*
export const customHistoryLogger = async (resource: any, params : any, type: string) => {
    //do custom history logging here
}

export const customLogoBox = (permissions: any, isHorizontalLayout: boolean) => {
    return <span>Your Logo</span>;
}

export const customAppTitle = (permissions: any, isHorizontalLayout: boolean) => {
    return <span>Your Title</span>;
}

import { Layout} from "ra-ui-materialui";

//NOTE: Returning Layout only for demo. Our framework layout is more advanced.
export const customLayout = (permissions: any) => {
    console.log("customLayout called "+  permissions);
    return Layout;
}

*/

export const queryClientConfig = (config: any) => {
    config = {
        defaultOptions: {
            queries: {
                staleTime: 0,
            },
        },
    };
    return config;
}

export const configureUserMenus = (permissions: any) => {
    return []
}

export const configureToolbarActions = (permissions: any) => {
    var buttons = [];
    if (isLargeAcademy() && isCoach()) {
        buttons.push(<SwitchDivisionMenuButton key={1}/>)
    }
    // buttons.push(<SupportIconButton key={2}/>)
    //using this to clear chess when navigating out
    if (permissions === UserRoles.STUDENT) { // Student only recive Game notifcations
        // buttons.push(<GameNotificationListener key={3} />);
    }
    return buttons;
}

export const themes = (defaultThemes: any) => {
    return defaultThemes;
}

export const wrapCustomDataProvider = (queryClient: any, dataProvider: any) => {
    return dataProvider;
}

import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from './i18n/en';
import frenchMessages from './i18n/fr';
import {ClassesStatus, TenantConfigNames, TenantTypeLookup, UserRoles} from "./helpers/constants.ts";
import {
    getUserId,
    isCoach,
    isDivisionAdmin,
    isDivisionCoach,
    isLargeAcademy,
    isOrgAdmin,
    isProCoach
} from "./businessLogic.ts";
import {getRemoteAndHybridClassEnrollments} from "./backend/enrollments.ts";
import {SwitchDivisionMenuButton} from "./components/SwitchDivisionMenuButton.tsx";

const messages = {
    fr: frenchMessages,
    en: englishMessages,
} as any;

export const customizeI18nProvider = () => {
    const supportedLanguagesList = [
            { locale: 'en', name: 'English', key: 'en' },
            { locale: 'fr', name: 'Français', key: 'fr' },
        ]
    if (navigator.language.startsWith('en-') || navigator.language === 'en' ) {
        supportedLanguagesList[0].locale = navigator.language;
    }
    return polyglotI18nProvider(
        (locale: string) => {
            let localVariation = locale
            if (navigator.language.startsWith('en-') ) {
                localVariation = 'en';
            }
            return messages[localVariation]
        },
        navigator.language,
        supportedLanguagesList
    );
}