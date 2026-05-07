import { UsersLogic } from './logic/users.ts';
import { TimeControlsLogic } from './logic/time_controls.ts';
import { StandardsLogic } from './logic/standards.ts';
import { StandardGradesLogic } from './logic/standard_grades.ts';
import { StandardCategoriesLogic } from './logic/standard_categories.ts';
import { StandardSectionsLogic } from './logic/standard_sections.ts';
import { CognitiveSkillsLogic } from './logic/cognitive_skills.ts';
import { AcademyTypesLogic } from './logic/academy_types.ts';
import { CertificateTemplatesLogic } from './logic/certificate_templates.ts';
import { ScheduleTypesLogic } from './logic/schedule_types.ts';
import { TeachingModesLogic } from './logic/teaching_modes.ts';
import { ClientTypesLogic } from './logic/client_types.ts';
import { DivisionsLogic } from './logic/divisions.ts';
import { ClientsLogic } from './logic/clients.ts';
import { LessonsLogic } from './logic/lessons.ts';
import { LessonBlockMappingsLogic } from './logic/lesson_block_mappings.ts';
import { TagsLogic } from './logic/tags.ts';
import { LevelsLogic } from './logic/levels.ts';
import { TrophyTypesLogic } from './logic/trophy_types.ts';
import { CoachesLogic } from './logic/coaches.ts';
import { CurriculumsLogic, CurriculumLessonsLogic } from './logic/curriculums.ts';
import { ClassesLogic } from './logic/classes.ts';
import { StudentsLogic } from './logic/students.ts';
import { SubscribablesLogic } from './logic/subscribables.ts';
import { SubscribersLogic } from './logic/subscribers.ts';
import { SubscriptionsLogic } from './logic/subscriptions.ts';
import { SubscriptionInvoicesLogic } from './logic/subscription_invoices.ts';
import { TrophiesLogic } from './logic/trophies.ts';
import { GamesLogic } from './logic/games.ts';
import { DiscussionTopicsLogic } from './logic/discussion_topics.ts';
import { RepliesLogic } from './logic/replies.ts';
import { DiscussionReadStatusesLogic } from './logic/discussion_read_statuses.ts';
import { ParentNotesLogic } from './logic/parent_notes.ts';
import { AssignmentsLogic } from './logic/assignments.ts';
import { AssignmentBlocksLogic } from './logic/assignment_blocks.ts';
import { CertificatesLogic } from './logic/certificates.ts';
import { ClassProgressesLogic } from './logic/class_progresses.ts';
import { ClassSchedulesLogic } from './logic/class_schedules.ts';
import { EnrollmentsLogic } from './logic/enrollments.ts';
import { InvoicesLogic } from './logic/invoices.ts';
import { ReviewsLogic } from './logic/reviews.ts';
import { LessonBlocksLogic } from './logic/lesson_blocks.ts';
import { BackgroundMusicsLogic } from './logic/background_musics.ts';
import { PaymentsLogic } from './logic/payments.ts';
import { TimesheetsLogic } from './logic/timesheets.ts';
import { AiBlockLogsLogic } from './logic/ai_block_logs.ts';
import { getLocalStorage, remoteLog, swanAPI } from '@mahaswami/vc-frontend';
import {TenantTypes, UserRoles} from "./constants.ts";
import {DataProvider} from "react-admin";
import {
    getParentEmailTemplate,
    getStudentEmailTemplateWithCredential,
    getStudentEmailTemplateWithoutCredential
} from "./helpers/emailTemplates.ts";
import {TenantConfigNames} from "./helpers/constants.ts";

export const businessLogic = () => {
    return [
        UsersLogic,
        TimeControlsLogic,
        StandardsLogic,
        StandardGradesLogic,
        StandardCategoriesLogic,
        StandardSectionsLogic,
        CognitiveSkillsLogic,
        AcademyTypesLogic,
        CertificateTemplatesLogic,
        ScheduleTypesLogic,
        TeachingModesLogic,
        ClientTypesLogic,
        DivisionsLogic,
        ClientsLogic,
        LessonsLogic,
        LessonBlockMappingsLogic,
        TagsLogic,
        LevelsLogic,
        TrophyTypesLogic,
        CoachesLogic,
        CurriculumsLogic,
        CurriculumLessonsLogic,
        ClassesLogic,
        StudentsLogic,
        SubscribablesLogic,
        SubscribersLogic,
        SubscriptionsLogic,
        SubscriptionInvoicesLogic,
        TrophiesLogic,
        GamesLogic,
        DiscussionTopicsLogic,
        RepliesLogic,
        DiscussionReadStatusesLogic,
        ParentNotesLogic,
        AssignmentsLogic,
        AssignmentBlocksLogic,
        CertificatesLogic,
        ClassProgressesLogic,
        ClassSchedulesLogic,
        EnrollmentsLogic,
        InvoicesLogic,
        ReviewsLogic,
        LessonBlocksLogic,
        BackgroundMusicsLogic,
        PaymentsLogic,
        TimesheetsLogic,
        AiBlockLogsLogic,
        SubscribablesLogic,
        SubscribersLogic,
        SubscriptionsLogic,
        SubscriptionInvoicesLogic,
        PaymentsLogic,
        TimesheetsLogic,
        TrophiesLogic,
    ];
};

const getRole = () => {
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

export async function getCurrentUserCoachId(dataProvider) {
    try {
        if(!isProCoach() && !isOrgCoach()) return;
        const {data: coaches} = await dataProvider.getList('coaches', {
            filter: {user_id: getUserId()},
            sort: {field: 'id', order: 'ASC'}
        });
        return coaches.map(coachRecord => coachRecord.id);
    } catch (error) {
        remoteLog("Error sending on getCurrentUserCoachId: ", error);
    }
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

export const filterByDivisionId = async (params, dataProvider) => {
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

export const isTenantAllowedCoaching = () => {
    const tenantAllowedCoaching = getLocalStorage('tenant_allowed_coaching');
    if (tenantAllowedCoaching) {
        return tenantAllowedCoaching.toLowerCase() === "true";
    }
    return false;
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

export const sendEmail = async (emailBody: any) => {
    const is_mail_blocked = getLocalStorage('is_mail_blocked');
    if (is_mail_blocked) return
    try {
        const { senderEmail, supportTeamEmail } = null// getEmailsBasedOnEnv();
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