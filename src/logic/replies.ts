import { RESOURCE } from "../views/replies"
import {getDiscussionReplyEmailTemplate, getGameDiscussionReplyEmailTemplate} from "../helpers/emailTemplates.ts";
import {sendEmail} from "../backend/common_logics.ts";
import {remoteLog} from "@mahaswami/vc-frontend";

export const RepliesLogic: any = {
    resource: RESOURCE,
    afterCreate: [createDiscussionReplyReadStatus],
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

async function createDiscussionReplyReadStatus(response, dataProvider, resource) {
    try {
        const reply = response.data;
        let userIds: number[], messageTemplate;
        const { data: topic } = await dataProvider.getOne("discussion_topics", {
            id: reply.discussion_topic_id, meta: { prefetch: ["games"] }
        });
        if (topic.game_id) {
            const { data: discussionStatus } = await dataProvider.getList("discussion_read_status", {
                filter: { discussion_topic_id: topic.id }
            });
            const discussionUserIds = discussionStatus.map(status => status.user_id);
            userIds = [...new Set([...discussionUserIds, reply.replied_by_user_id])];
            messageTemplate = getGameDiscussionReplyEmailTemplate(topic.game.event, reply, topic);
        } else {
            const { data: classData } = await dataProvider.getOne("classes", { id: topic.class_id });
            const { data: coach } = await dataProvider.getOne("coaches", { id: classData.coach_id });

            const { data: enrollments } = await dataProvider.getList("enrollments", {
                filter: { class_id: topic.class_id },
                pagination: { page: 1, perPage: 10000 },
            });
            const studentIds = enrollments.map(e => e.student_id);
            let { data: students } = await dataProvider.getList("students", {
                filter: { id: studentIds },
                pagination: { page: 1, perPage: 10000 },
            });
            userIds = [...students.map(s => s.user_id), coach.user_id];
            messageTemplate = getDiscussionReplyEmailTemplate(classData.name, reply, topic);
        }

        const { data: users } = await dataProvider.getList("users", {
            filter: { id: userIds },
            pagination: { page: 1, perPage: 10000 },
        });
        const discussionReadStatuses = users.map((user: any) => ({
            user_id: user.id,
            reply_id: reply.id,
            discussion_topic_id: topic.id,
            is_read: user.id === reply.replied_by_user_id,
        }));
        await Promise.all(
            discussionReadStatuses.map(readStatus =>
                dataProvider.create("discussion_read_status", { data: readStatus })
            )
        );
        // Notify email to all students
        const usersToNotify = users.filter((user) => user.id !== reply.replied_by_user_id)
        const emails = usersToNotify.map(user => user.email);
        if (emails.length > 0) {
            await sendEmail({
                to: emails,
                ...messageTemplate
            })
        }
    } catch (error) {
        console.error("Error creating discussion reply read status :", error);
        remoteLog("Error sending on createDiscussionReplyReadStatus: ", error);
    } finally {
        return response;
    }
}