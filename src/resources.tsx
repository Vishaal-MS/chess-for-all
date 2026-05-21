import { HistoryMenu, HistoryResource } from './views/history.tsx';
import { UsersMenu, UsersResource } from './views/users.tsx';
import { DocumentTemplatesMenu, DocumentTemplatesResource } from './views/document_templates.tsx';
import { DigitalSignaturesResource } from './views/digital_signatures.tsx';
import {
    isHistoryModuleActive, isDocumentGenerationModuleActive, AutoLayoutMenu, NestedMenu, getLocalStorage
} from '@mahaswami/vc-frontend';
import GearIcon from '@mui/icons-material/Settings';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import Person2Icon from '@mui/icons-material/Person2';
import InboxSharpIcon from '@mui/icons-material/InboxSharp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import {TimeControlsMenu, TimeControlsResource } from './views/time_controls.tsx';
import {StandardsMenu, StandardsResource} from './views/standards.tsx';
import { StandardGradesResource } from './views/standard_grades.tsx';
import { StandardCategoriesResource } from './views/standard_categories.tsx';
import { StandardSectionsResource } from './views/standard_sections.tsx';
import {CognitiveSkillsMenu, CognitiveSkillsResource} from './views/cognitive_skills.tsx';
import { AcademyTypesResource } from './views/academy_types.tsx';
import { CertificateTemplatesResource } from './views/certificate_templates.tsx';
import { ScheduleTypesResource } from './views/schedule_types.tsx';
import { TeachingModesResource } from './views/teaching_modes.tsx';
import { ClientTypesResource } from './views/client_types.tsx';
import {DivisionsMenu, DivisionsResource} from './views/divisions.tsx';
import { ClientsResource, ClientsMenu } from './views/clients.tsx';
import { LessonBlocksResource, LessonBlocksMenu } from './views/lesson_blocks.tsx';
import { LessonsResource, LessonsMenu } from './views/lessons.tsx';
import { LessonBlockMappingsResource } from './views/lesson_block_mappings.tsx';
import { TagsResource } from './views/tags.tsx';
import { LevelsResource } from './views/levels.tsx';
import { TrophyTypesResource } from './views/trophy_types.tsx';
import {BackgroundMusicsMenu, BackgroundMusicsResource} from './views/background_musics.tsx';
import {AiBlockLogsMenu, AiBlockLogsResource} from './views/ai_block_logs.tsx';
import {CoachesMenu, CoachesResource} from './views/coaches.tsx';
import { CurriculumsResource, CurriculumsMenu, CurriculumLessonsResource} from './views/curriculums.tsx';
import { ClassesResource, ClassesMenu } from './views/classes.tsx';
import { StudentsResource } from './views/students.tsx';
import { GamesResource, GamesMenu } from './views/games.tsx';
import { DiscussionTopicsResource } from './views/discussion_topics.tsx';
import { RepliesResource } from './views/replies.tsx';
import { DiscussionReadStatusesResource } from './views/discussion_read_statuses.tsx';
import { ParentNotesResource } from './views/parent_notes.tsx';
import { AssignmentsResource } from './views/assignments.tsx';
import { AssignmentBlocksResource } from './views/assignment_blocks.tsx';
import {CertificatesMenu, CertificatesResource} from './views/certificates.tsx';
import { ClassProgressesResource } from './views/class_progresses.tsx';
import { ClassSchedulesResource } from './views/class_schedules.tsx';
import { EnrollmentsResource, EnrollmentsMenu } from './views/enrollments.tsx';
import { InvoicesResource } from './views/invoices.tsx';
import {ReviewsMenu, ReviewsResource} from './views/reviews.tsx';
import {SubscribablesMenu, SubscribablesResource} from './views/subscribables.tsx';
import {SubscribersMenu, SubscribersResource} from './views/subscribers.tsx';
import { SubscriptionsResource, SubscriptionsMenu } from './views/subscriptions.tsx';
import { SubscriptionInvoicesResource } from './views/subscription_invoices.tsx';
import { PaymentsResource } from './views/payments.tsx';
import {TimesheetsMenu, TimesheetsResource} from './views/timesheets.tsx';
import { TrophiesResource } from './views/trophies.tsx';
import { SnippetsLibrariesResource, SnippetsLibrariesMenu } from './views/snippets_libraries.tsx';
import {AccessDenied, Authenticated, CanAccess, CustomRoutes, Menu} from 'react-admin';
import {Route} from "react-router-dom";
import {ManualAssignmentCheckins} from "./views/manual_assignment_check/ManualAssignmentCheckins.tsx";
import {ClearAll, Rule } from '@mui/icons-material';
import {Fragment} from "react";
import {DirectAssignmentShow} from "./views/class/directAssignmentShow.tsx";
import {StudentAssignmentLive} from "./views/class/studentAssignmentLive.tsx";
import BoardReport from './views/board_report/BoardReport.tsx';
import {
    isAcademy, isAnySchoolFlavorActive, isLargeAcademy, isOrgAdmin,
    isRegularSchoolFlavored,
    isSchoolStandardLinked,
    isShowLargeAcademyMenus,
    isTenantAllowedCoaching
} from "./businessLogic.ts";
import Dashboard from "./views/dashboard/dashboard.tsx";
import {CoachDashBoard} from "./views/dashboard/coachmaindashboard.tsx";
import {OrgAdminMainDashBoard} from "./views/dashboard/orgadmindashboard.tsx";
import { CoachView } from './views/coach/coachView.tsx';
import {Studentmaindashboard} from "./views/dashboard/studentmaindashboard.tsx";
import {Parentmaindashboard} from "./views/dashboard/parentmaindashboard.tsx";
import {BillingView} from "./views/billing/billing.tsx";
import {MessagesList} from "./views/reviews/Reviews.tsx";
import {PublisherProfile} from "./views/profiles/publisherProfile.tsx";
import { LessonBlockTagIdsUpdate } from './views/developer/LessonBlockTagIdsUpdate.tsx';
import {LessonBlockDataMigrateToSnippetLibrary} from "./views/developer/LessonBlockDataMigrateToSnippetLibrary.tsx";
import {DataMigration} from "./views/developer/DataMigration.tsx";
import {ApplyHashTenant} from "./views/developer/ApplyHashTenant.tsx";
import {TroubleshootBlockMapMissing} from "./views/developer/TroubleshootBlockMapMissing.tsx";
import {CoachPaymentsList} from "./views/billing/payments.tsx";
import {ImportData} from "./views/developer/ImportData.tsx";
import {AchievementsList} from "./views/certificates/achievements.tsx";
import { WipeTenent } from './views/wipe_tenant/WipeTenant.tsx';
import { ClearVoiceoverCache } from './views/tools/ClearVoiceoverCache.tsx';
import {AppSettings} from "./views/users/settings.tsx";
import {UserRoles} from "./helpers/constants.ts";
// {{VC:INSERT:RESOURCE_IMPORTS}}

export const configureResources = (permissions: any) => {
    let result = [
        <CustomRoutes key={1}>
            <Route path="/dashboard" element={<Authenticated><Dashboard /></Authenticated>} />
            <Route path="/pro_coach_dashboard" element={<Authenticated> <CoachDashBoard /></Authenticated>}/>
            <Route path="/org_coach_dashboard" element={<Authenticated> <CoachView/></Authenticated>}/>
            <Route path={"/org_admin_main_dashboard"} element={<Authenticated><OrgAdminMainDashBoard/></Authenticated>}/>
            <Route path="/pro_coach_billing_dashboard" element={<Authenticated><BillingView/></Authenticated>} />
            <Route path="/student_dashboard" element={<Authenticated><Studentmaindashboard/></Authenticated>} />
            <Route path="/parent_dashboard" element={<Authenticated><Parentmaindashboard/></Authenticated>} />
            <Route path="/performance_report" element={<Authenticated><BoardReport/></Authenticated>} />
            <Route path="/achievements" element={<Authenticated><AchievementsList/></Authenticated>} />
            <Route path={"/coach_payments"} element={<Authenticated><CoachPaymentsList/></Authenticated>}/>
            <Route path={"/app_settings"} element = {<Authenticated><AppSettings/></Authenticated>}/>,
            <Route path={"/troubleshoot_block_map_missing"} element={<Authenticated><TroubleshootBlockMapMissing/></Authenticated>}/>
            <Route path={"/hash_tenant"} element={<Authenticated><CanAccess action={"hash_tenant"} resource={"tenants"} accessDenied={<AccessDenied/>}><ApplyHashTenant/></CanAccess></Authenticated>}/>
            <Route path={"/populate_100_golden_games"} element={<Authenticated><DataMigration/></Authenticated>}/>
            <Route path={"/block_migrate_to_snippets"} element={<Authenticated><LessonBlockDataMigrateToSnippetLibrary /></Authenticated>}/>
            <Route path={"/block_tagIds_update"} element={<Authenticated><LessonBlockTagIdsUpdate /></Authenticated>}/>
            <Route path={"/import_data"} element={<Authenticated><ImportData /></Authenticated>}/>
            <Route path={"/my_profile"} element={<Authenticated><PublisherProfile /></Authenticated>}/>
            <Route path={"/manual_assignment_checkins"} element={<Authenticated><ManualAssignmentCheckins /></Authenticated>}/>
            <Route path={"/wipe_tenant"} element={<Authenticated><WipeTenent /></Authenticated>}/>
            <Route path={"/messages"} element={<Authenticated><MessagesList /></Authenticated>}/>
            <Route path={"/clear_voiceover_cache"} element={<Authenticated><ClearVoiceoverCache /></Authenticated>}/>
        </CustomRoutes>,
        <CustomRoutes key={35} noLayout>
            <Route path="/assignments/:tId/:uniqueDirectAssignmentId" element={<DirectAssignmentShow/>} />
            <Route path="/lessons/:id/live" element={<StudentAssignmentLive/>} />
        </CustomRoutes>,
        HistoryResource,
        UsersResource,
        DocumentTemplatesResource,
        DigitalSignaturesResource,
        TimeControlsResource,
        StandardsResource,
        StandardGradesResource,
        StandardCategoriesResource,
        StandardSectionsResource,
        CognitiveSkillsResource,
        AcademyTypesResource,
        CertificateTemplatesResource,
        ScheduleTypesResource,
        TeachingModesResource,
        ClientTypesResource,
        DivisionsResource,
        ClientsResource,
        LessonBlocksResource,
        LessonsResource,
        LessonBlockMappingsResource,
        TagsResource,
        LevelsResource,
        TrophyTypesResource,
        BackgroundMusicsResource,
        AiBlockLogsResource,
        CoachesResource,
        CurriculumsResource,
        CurriculumLessonsResource,
        ClassesResource,
        StudentsResource,
        GamesResource,
        DiscussionTopicsResource,
        DiscussionReadStatusesResource,
        ParentNotesResource,
        AssignmentsResource,
        AssignmentBlocksResource,
        CertificatesResource,
        ClassProgressesResource,
        ClassSchedulesResource,
        EnrollmentsResource,
        InvoicesResource,
        ReviewsResource,
        SubscribablesResource,
        SubscribersResource,
        SubscriptionsResource,
        SubscriptionInvoicesResource,
        PaymentsResource,
        TimesheetsResource,
        TrophiesResource,
        SnippetsLibrariesResource,
        // VC:INSERT:RESOURCE_ENTRY
    ]

    return result;
}

export const configureMenus = (permissions: any) => {

    //TODO: This could be done in a less verbose way by having a hash and use React.createElement style
    const allowPublishing = getLocalStorage('tenant_allowed_publishing');

    const superAdminMenus =
        <Fragment>
            <CertificatesMenu />
            <SnippetsLibrariesMenu />
            <Menu.ResourceItem name="support_topics" />
            <Menu.ResourceItem name="support_topic_logs" />
            <AiBlockLogsMenu />
            <StandardsMenu />
            <CognitiveSkillsMenu />
            <SubscribablesMenu />
            <SubscribersMenu />
            <ReviewsMenu />
            <HistoryMenu />
            <BackgroundMusicsMenu />
            <TimeControlsMenu />
            <Menu.Item to="/wipe_tenant" primaryText="Wipe Tenant" leftIcon={<ClearAll />} />
        </Fragment>

    const adminMenusAll =
        <>
            <ClassesMenu />
            <CurriculumsMenu />
            <SubscriptionsMenu />
            <LessonsMenu />
            <LessonBlocksMenu />
            <ClientsMenu />
            <Menu.Item to="/manual_assignment_checkins" primaryText="Assignment Checkins" leftIcon={<Rule/>} />
            <GamesMenu />
            <TimeControlsMenu />
            <AutoLayoutMenu>
                <SnippetsLibrariesMenu />
                <NestedMenu label="Settings" icon={<GearIcon />} defaultOpen={false}>
                    {isDocumentGenerationModuleActive() && <DocumentTemplatesMenu />}
                    {isHistoryModuleActive() && <HistoryMenu />}
                    <UsersMenu />
                </NestedMenu>
            </AutoLayoutMenu>
        </>

    const schoolMenus = <Menu.Item to="/performance_report" primaryText="Performance Report" leftIcon={<StackedLineChartIcon/>} />

    const proCoachMenus =
        <>
            <ClassesMenu />
            <CurriculumsMenu />
            <SubscriptionsMenu />
            <LessonsMenu />
            <LessonBlocksMenu />
            <ClientsMenu />
            <Menu.Item to="/manual_assignment_checkins" primaryText="Assignment Checkins" leftIcon={<Rule/>} />
            {(isSchoolStandardLinked() || isRegularSchoolFlavored()) && schoolMenus}
            <GamesMenu />
        </>

    const orgCoachMenus =
        <Fragment>
            <ClassesMenu />
            {isAcademy() && <TimesheetsMenu />}
            <Menu.Item to="/manual_assignment_checkins" primaryText="Assignment Checkins" leftIcon={<Rule/>} />
            <GamesMenu />
        </Fragment>


    const orgAdminMenus =
        <Fragment>
            { isShowLargeAcademyMenus() && isTenantAllowedCoaching() && <Menu.ResourceItem name="classes"/>}
            {isShowLargeAcademyMenus() && <CurriculumsMenu />}
            {isShowLargeAcademyMenus() && <SubscriptionsMenu />}
            {isShowLargeAcademyMenus() && <LessonsMenu />}
            {isShowLargeAcademyMenus() && <LessonBlocksMenu />}
            {isShowLargeAcademyMenus() && isTenantAllowedCoaching() && <ClientsMenu />}
            {isShowLargeAcademyMenus() && isTenantAllowedCoaching() &&
                <Menu.Item to="/manual_assignment_checkins" primaryText="Assignment Checkins" leftIcon={<Rule/>} />}
            {isOrgAdmin() && isAcademy() && isLargeAcademy() && <DivisionsMenu />}
            <CoachesMenu />
            {(isShowLargeAcademyMenus() && isTenantAllowedCoaching() && !isAnySchoolFlavorActive()) && <TimesheetsMenu />}
            {(isSchoolStandardLinked() || isRegularSchoolFlavored()) && schoolMenus}
            {isShowLargeAcademyMenus() && <GamesMenu />}
        </Fragment>

    const contentPublisherMenus =
        <Fragment>
            <CurriculumsMenu />
            <LessonsMenu />
            <LessonBlocksMenu />
            <SubscribersMenu />
            <ReviewsMenu />
            <Menu.Item to="/messages" primaryText="Messages" leftIcon={<InboxSharpIcon/>} />
            <Menu.Item to="/my_profile" primaryText={"My Profile"} leftIcon={<Person2Icon/>}/>
        </Fragment>

    const publisherMenus =
        <Fragment>
            <SubscribersMenu />
            <ReviewsMenu />
            <Menu.Item to="/my_profile" primaryText={"My Profile"} leftIcon={<Person2Icon/>}/>
            <Menu.Item to="/messages" primaryText="Messages" leftIcon={<InboxSharpIcon/>} />
        </Fragment>
    const studentMenus = <EnrollmentsMenu />

    const parentMenus =
        <Fragment>
            <Menu.Item to="/parent_dashboard" primaryText="Dashboard" leftIcon={<DashboardIcon />} />
            <EnrollmentsMenu />
        </Fragment>

    if (UserRoles.PRO_COACH === permissions && !isTenantAllowedCoaching()) {
        return contentPublisherMenus;
    }

    if (permissions === UserRoles.PRO_COACH && allowPublishing === "TRUE") {
        return (
            <Fragment>
                {proCoachMenus}
                {isShowLargeAcademyMenus() && publisherMenus}
            </Fragment>
        );
    }

    if ((permissions === UserRoles.ORG_ADMIN || permissions === UserRoles.DIVISION_ADMIN) && allowPublishing === "TRUE") {
        return (
            <Fragment>
                {orgAdminMenus}
                {isShowLargeAcademyMenus() && publisherMenus}
            </Fragment>
        );
    }
    if (UserRoles.PRO_COACH === permissions) {
        return proCoachMenus;
    }
    if (UserRoles.ORG_COACH === permissions) {
        return orgCoachMenus;
    }
    if (UserRoles.ORG_ADMIN === permissions || UserRoles.DIVISION_ADMIN === permissions) {
        return orgAdminMenus;
    }
    if (UserRoles.STUDENT === permissions) {
        return studentMenus;
    }
    if (UserRoles.PARENT === permissions) {
        return parentMenus;
    }
    if (UserRoles.DIVISION_COACH === permissions) {
        return orgCoachMenus;
    }
    if (UserRoles.SUPER_ADMIN === permissions) {
        return superAdminMenus
    }
    if (UserRoles.ADMIN === permissions) {
        return orgAdminMenus
    }
    return superAdminMenus;
}

export const configureLandingPage = (permissions: any) => {
    const classCount = getLocalStorage("total_classes_at_login");
    let classStartPage = (classCount === 0 && !isSchoolStandardLinked()) ? "/classes/create" : "/classes";
    if (isRegularSchoolFlavored()) {
        classStartPage = (classCount === 0) ? "/classes/create?type=school": "/classes";
    }
    const activeEnrollmentId = getLocalStorage("enrollment_id");
    let studentStartPage = activeEnrollmentId ? `/enrollments/${activeEnrollmentId}/show` : "/enrollments";
    let proCoachStartPage = isTenantAllowedCoaching() ? classStartPage : "/curriculum";

    return {
        "super_admin": "/tenants",
        "admin": "/tenants",
        "pro_coach": proCoachStartPage,
        "student": studentStartPage,
        "parent" : "/parent_dashboard",
        "org_coach":"/classes",
        "org_admin": isShowLargeAcademyMenus() ? proCoachStartPage : "/divisions",
        "division_admin": classStartPage,
        "division_coach": "/classes"
    }
}