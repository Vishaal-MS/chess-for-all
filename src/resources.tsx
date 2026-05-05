
import { HistoryMenu, HistoryResource } from './views/history.tsx';
import { UsersMenu, UsersResource } from './views/users.tsx';
import { DocumentTemplatesMenu, DocumentTemplatesResource } from './views/document_templates.tsx';
import { DigitalSignaturesResource } from './views/digital_signatures.tsx';
import { isHistoryModuleActive, isDocumentGenerationModuleActive, AutoLayoutMenu, NestedMenu } from '@mahaswami/vc-frontend';
import GearIcon from '@mui/icons-material/Settings';
import { TimeControlsResource, TimeControlsMenu } from './views/time_controls.tsx';
import { StandardsResource, StandardsMenu } from './views/standards.tsx';
import { StandardGradesResource, StandardGradesMenu } from './views/standard_grades.tsx';
import { StandardCategoriesResource, StandardCategoriesMenu } from './views/standard_categories.tsx';
import { StandardSectionsResource, StandardSectionsMenu } from './views/standard_sections.tsx';
import { CognitiveSkillsResource, CognitiveSkillsMenu } from './views/cognitive_skills.tsx';
import { AcademyTypesResource, AcademyTypesMenu } from './views/academy_types.tsx';
import { CertificateTemplatesResource, CertificateTemplatesMenu } from './views/certificate_templates.tsx';
import { ScheduleTypesResource, ScheduleTypesMenu } from './views/schedule_types.tsx';
import { TeachingModesResource, TeachingModesMenu } from './views/teaching_modes.tsx';
import { ClientTypesResource, ClientTypesMenu } from './views/client_types.tsx';
import { DivisionsResource, DivisionsMenu } from './views/divisions.tsx';
import { ClientsResource, ClientsMenu } from './views/clients.tsx';
import { LessonBlocksResource, LessonBlocksMenu } from './views/lesson_blocks.tsx';
import { LessonsResource, LessonsMenu } from './views/lessons.tsx';
import { LessonBlockMappingsResource, LessonBlockMappingsMenu } from './views/lesson_block_mappings.tsx';
import { TagsResource, TagsMenu } from './views/tags.tsx';
import { LevelsResource, LevelsMenu } from './views/levels.tsx';
import { TrophyTypesResource, TrophyTypesMenu } from './views/trophy_types.tsx';
import { BackgroundMusicsResource, BackgroundMusicsMenu } from './views/background_musics.tsx';
import { AiBlockLogsResource, AiBlockLogsMenu } from './views/ai_block_logs.tsx';
import { CoachesResource, CoachesMenu } from './views/coaches.tsx';
import { CurriculumsResource, CurriculumsMenu, CurriculumLessonsResource} from './views/curriculums.tsx';
import { ClassesResource, ClassesMenu } from './views/classes.tsx';
import { StudentsResource, StudentsMenu } from './views/students.tsx';
import { GamesResource, GamesMenu } from './views/games.tsx';
import { DiscussionTopicsResource, DiscussionTopicsMenu } from './views/discussion_topics.tsx';
import { RepliesResource, RepliesMenu } from './views/replies.tsx';
import { DiscussionReadStatusesResource, DiscussionReadStatusesMenu } from './views/discussion_read_statuses.tsx';
import { ParentNotesResource, ParentNotesMenu } from './views/parent_notes.tsx';
import { AssignmentsResource, AssignmentsMenu } from './views/assignments.tsx';
import { AssignmentBlocksResource, AssignmentBlocksMenu } from './views/assignment_blocks.tsx';
import { CertificatesResource, CertificatesMenu } from './views/certificates.tsx';
import { ClassProgressesResource, ClassProgressesMenu } from './views/class_progresses.tsx';
import { ClassSchedulesResource, ClassSchedulesMenu } from './views/class_schedules.tsx';
import { EnrollmentsResource, EnrollmentsMenu } from './views/enrollments.tsx';
import { InvoicesResource, InvoicesMenu } from './views/invoices.tsx';
import { ReviewsResource, ReviewsMenu } from './views/reviews.tsx';
import { SubscribablesResource, SubscribablesMenu } from './views/subscribables.tsx';
import { SubscribersResource, SubscribersMenu } from './views/subscribers.tsx';
import { SubscriptionsResource, SubscriptionsMenu } from './views/subscriptions.tsx';
import { SubscriptionInvoicesResource, SubscriptionInvoicesMenu } from './views/subscription_invoices.tsx';
import { PaymentsResource, PaymentsMenu } from './views/payments.tsx';
import { TimesheetsResource, TimesheetsMenu } from './views/timesheets.tsx';
import { TrophiesResource, TrophiesMenu } from './views/trophies.tsx';
// {{VC:INSERT:RESOURCE_IMPORTS}}

export const configureResources = (permissions: any) => {
    let result = [
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
        // VC:INSERT:RESOURCE_ENTRY
    ]

    return result;
}

export const configureMenus = (permissions: any) => {

    //TODO: This could be done in a less verbose way by having a hash and use React.createElement style

    const superAdminMenus =
        <>
        </>

    const adminMenusAll =
        <>
            <AutoLayoutMenu>
                {/* {{VC:INSERT:MENU_ENTRY}} */}
                {/*<TimeControlsMenu />*/}
                {/*<StandardsMenu />*/}
                {/*<StandardGradesMenu />*/}
                {/*<StandardCategoriesMenu />*/}
                {/*<StandardSectionsMenu />*/}
                {/*<CognitiveSkillsMenu />*/}
                {/*<AcademyTypesMenu />*/}
                {/*<CertificateTemplatesMenu />*/}
                {/*<ScheduleTypesMenu />*/}
                {/*<TeachingModesMenu />*/}
                {/*<ClientTypesMenu />*/}
                {/*<DivisionsMenu />*/}
                <ClientsMenu />
                <LessonBlocksMenu />
                <LessonsMenu />
                {/*<LessonBlockMappingsMenu />*/}
                {/*<TagsMenu />*/}
                {/*<LevelsMenu />*/}
                {/*<TrophyTypesMenu />*/}
                {/*<BackgroundMusicsMenu />*/}
                {/*<AiBlockLogsMenu />*/}
                {/*<CoachesMenu />*/}
                <CurriculumsMenu />
                {/*<ClassesMenu />*/}
                {/*<StudentsMenu />*/}
                {/*<GamesMenu />*/}
                {/*<DiscussionTopicsMenu />*/}
                {/*<RepliesMenu />*/}
                {/*<DiscussionReadStatusesMenu />*/}
                {/*<ParentNotesMenu />*/}
                {/*<AssignmentsMenu />*/}
                {/*<AssignmentBlocksMenu />*/}
                {/*<CertificatesMenu />*/}
                {/*<ClassProgressesMenu />*/}
                {/*<ClassSchedulesMenu />*/}
                {/*<EnrollmentsMenu />*/}
                {/*<InvoicesMenu />*/}
                {/*<ReviewsMenu />*/}
                {/*<SubscribablesMenu />*/}
                {/*<SubscribersMenu />*/}
                {/*<SubscriptionsMenu />*/}
                {/*<SubscriptionInvoicesMenu />*/}
                {/*<PaymentsMenu />*/}
                {/*<TimesheetsMenu />*/}
                {/*<TrophiesMenu />*/}
                <NestedMenu label="Settings" icon={<GearIcon />} defaultOpen={false}>
                    {isDocumentGenerationModuleActive() && <DocumentTemplatesMenu />}
                    {isHistoryModuleActive() && <HistoryMenu />}
                    <UsersMenu />
                </NestedMenu>
            </AutoLayoutMenu>
        </>

    if ('super_admin' === permissions) {
        return superAdminMenus;
    }
    if ('admin' === permissions) {
        return adminMenusAll;
    }
    return adminMenusAll;

}

export const configureLandingPage = (permissions: any) => {
    return {
        "super_admin": "/tenants",
    }
}