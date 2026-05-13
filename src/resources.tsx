import { HistoryMenu, HistoryResource } from './views/history.tsx';
import { UsersMenu, UsersResource } from './views/users.tsx';
import { DocumentTemplatesMenu, DocumentTemplatesResource } from './views/document_templates.tsx';
import { DigitalSignaturesResource } from './views/digital_signatures.tsx';
import { isHistoryModuleActive, isDocumentGenerationModuleActive, AutoLayoutMenu, NestedMenu } from '@mahaswami/vc-frontend';
import GearIcon from '@mui/icons-material/Settings';
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
import { DivisionsResource } from './views/divisions.tsx';
import { ClientsResource, ClientsMenu } from './views/clients.tsx';
import { LessonBlocksResource, LessonBlocksMenu } from './views/lesson_blocks.tsx';
import { LessonsResource, LessonsMenu } from './views/lessons.tsx';
import { LessonBlockMappingsResource } from './views/lesson_block_mappings.tsx';
import { TagsResource } from './views/tags.tsx';
import { LevelsResource } from './views/levels.tsx';
import { TrophyTypesResource } from './views/trophy_types.tsx';
import {BackgroundMusicsMenu, BackgroundMusicsResource} from './views/background_musics.tsx';
import {AiBlockLogsMenu, AiBlockLogsResource} from './views/ai_block_logs.tsx';
import { CoachesResource } from './views/coaches.tsx';
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
import { TimesheetsResource } from './views/timesheets.tsx';
import { TrophiesResource } from './views/trophies.tsx';
import { SnippetsLibrariesResource, SnippetsLibrariesMenu } from './views/snippets_libraries.tsx';
import {Authenticated, CustomRoutes, Menu} from 'react-admin';
import {Route} from "react-router-dom";
import {ManualAssignmentCheckins} from "./views/manual_assignment_check/ManualAssignmentCheckins.tsx";
import { Rule } from '@mui/icons-material';
import {Fragment} from "react";
// {{VC:INSERT:RESOURCE_IMPORTS}}

export const configureResources = (permissions: any) => {
    let result = [
        <CustomRoutes key={1}>
            <Route path={"/manual_assignment_checkins"}
               element={<Authenticated><ManualAssignmentCheckins /></Authenticated>}
            />
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
        RepliesResource,
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

    const studentMenus = <EnrollmentsMenu />

    if ('super_admin' === permissions) {
        return superAdminMenus;
    }
    if ('admin' === permissions) {
        return adminMenusAll;
    }
    if ('student' === permissions) {
        return studentMenus;
    }
    return adminMenusAll;

}

export const configureLandingPage = (permissions: any) => {
    return {
        "super_admin": "/tenants",
    }
}