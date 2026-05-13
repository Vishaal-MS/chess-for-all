import { RESOURCE } from "../views/discussion_topics"
import {getDiscussionTopicEmailTemplate, getGameDiscussionTopicTemplate} from "../helpers/emailTemplates.ts";
import {sendEmail} from "../businessLogic.ts";
import {remoteLog} from "@mahaswami/vc-frontend";

export const DiscussionTopicsLogic: any = {
    resource: RESOURCE,
    afterCreate: [createDiscussionTopicReadStatus],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}

async function createDiscussionTopicReadStatus(response, dataProvider, resource) {
    try {
        const topic = response.data;
        let classData, gamePlayerIds: number[], messageTemplate;

        if (topic.game_id) {
            const { data: game } = await dataProvider.getOne("games", {
                id: topic.game_id, meta: { prefetch: ["classes"] }
            });
            classData = game.class;
            messageTemplate = getGameDiscussionTopicTemplate(topic, classData.name, game.event);
            gamePlayerIds = [game.player1_student_id, game.player2_student_id];
        } else {
            const { data: discussionClass } = await dataProvider.getOne("classes", { id: topic.class_id });
            classData = discussionClass;
            messageTemplate = getDiscussionTopicEmailTemplate(topic, discussionClass);
        }
        const { data: coach } = await dataProvider.getOne("coaches", { id: classData.coach_id });
        const { data: enrollments } = await dataProvider.getList("enrollments", {
            filter: { class_id: classData.id },
            pagination: { page: 1, perPage: 10000 },
        });

        const studentIds = enrollments.map(e => e.student_id);
        let { data: students } = await dataProvider.getList("students", {
            filter: { id: studentIds },
            pagination: { page: 1, perPage: 10000 },
        });

        if (topic.game_id) {
            students = students.filter(student => gamePlayerIds.includes(student.id) || student.user_id === topic.created_by_user_id);
        }
        const allUserIds = [...students.map(s => s.user_id), coach.user_id];
        const { data: users } = await dataProvider.getList("users", {
            filter: { id: allUserIds },
            pagination: { page: 1, perPage: 10000 },
        });

        const discussionReadStatuses = users.map((user: any) => ({
            user_id: user.id,
            discussion_topic_id: topic.id,
            is_read: user.id === topic.created_by_user_id
        }));
        // Notify email to students and coach.
        const usersToNotify = users.filter(user => user.id !== topic.created_by_user_id);
        const emails = usersToNotify.map(user => user.email);
        if (emails.length > 0) {
            await sendEmail({
                to: emails,
                ...messageTemplate
            })
        }
        await Promise.all(
            discussionReadStatuses.map(readStatus =>
                dataProvider.create("discussion_read_status", { data: readStatus })
            )
        );
    } catch (error) {
        console.error("Error creating Discussion topic read status", error);
        remoteLog("Error sending on createDiscussionTopicReadStatus: ", error);
    } finally {
        return response;
    }
};