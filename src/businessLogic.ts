import { UsersLogic } from './logic/users.ts';
import { ClientsLogic } from './logic/clients.ts';
import { LessonsLogic } from './logic/lessons.ts';
import { CoachesLogic } from './logic/coaches.ts';
import {CurriculumLessonsLogic, CurriculumsLogic} from './logic/curriculums.ts';
import { ClassesLogic } from './logic/classes.ts';
import { StudentsLogic } from './logic/students.ts';
import { DiscussionTopicsLogic } from './logic/discussion_topics.ts';
import { RepliesLogic } from './logic/replies.ts';
import { ClassProgressesLogic } from './logic/class_progresses.ts';
import { ClassSchedulesLogic } from './logic/class_schedules.ts';
import { EnrollmentsLogic } from './logic/enrollments.ts';
import { LessonBlocksLogic } from './logic/lesson_blocks.ts';
import {TenantsLogic} from "./logic/tenants.ts";
import {ParentNotesLogic} from "./logic/parent_notes.ts";
import {SubscriptionsLogic} from "./logic/subscriptions.ts";
import {SnippetsLibrariesLogic} from "./logic/snippets_libraries.ts";
import {TimesheetsLogic} from "./logic/timesheets.ts";
import {StandardsLogic} from "./logic/standards.ts";
import {StandardGradesLogic} from "./logic/standard_grades.ts";
import {StandardCategoriesLogic} from "./logic/standard_categories.ts";
import {StandardSectionsLogic} from "./logic/standard_sections.ts";
import {ReviewsLogic} from "./logic/reviews.ts";
import {SubscribersLogic} from "./logic/subscribers.ts";
import {GamesLogic} from "./logic/games.ts";
import {checkFilterValues, parseToUTCDate} from './backend/common_logics.ts';
import {TagsLogic} from "./logic/tags.ts";

export const businessLogic = () => {
    return [
        {
            resource: "*",
            beforeSave: [parseToUTCDate],
            beforeGetList: [checkFilterValues]
        },
        UsersLogic,
        ClientsLogic,
        LessonsLogic,
        CoachesLogic,
        CurriculumLessonsLogic,
        ClassesLogic,
        StudentsLogic,
        DiscussionTopicsLogic,
        RepliesLogic,
        ClassProgressesLogic,
        ClassSchedulesLogic,
        EnrollmentsLogic,
        LessonBlocksLogic,
        TenantsLogic,
        ParentNotesLogic,
        SubscriptionsLogic,
        CurriculumsLogic,
        SnippetsLibrariesLogic,
        TimesheetsLogic,
        StandardsLogic,
        StandardGradesLogic,
        StandardCategoriesLogic,
        StandardSectionsLogic,
        ReviewsLogic,
        CurriculumLessonsLogic,
        SubscribersLogic,
        GamesLogic,
        TagsLogic
    ];
};







