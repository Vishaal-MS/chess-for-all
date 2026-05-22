import { useState } from "react";
import { closeDialog, useRealtimeComms } from "@mahaswami/vc-frontend";
import { Send } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import {
    required,
    SaveButton,
    SimpleForm,
    TextInput,
    Toolbar,
    useCreate,
    useNotify,
} from "react-admin";
import { getUserId } from "../../backend/common_logics";

type RecordType = {
    referencesData?: Record<string, number>;
    topicId?: number;
}

type DiscussionPostCreateProps = {
    record: RecordType;
    refreshFn: () => void;
    isNew?: boolean;
    discussionTopic: string;
}

const DiscussionPostCreate: React.FC<DiscussionPostCreateProps> = ({
    record,
    refreshFn,
    isNew = false,
    discussionTopic,
}) => {
    const [create] = useCreate();
    const notify = useNotify();
    const currentUserId = getUserId();
    const [saving, setSaving] = useState(false);
    const realtimeComms = useRealtimeComms();

    const handleSubmit = (data: any) => {
        const timestamp = new Date();
        setSaving(true);

        const onSuccess = (data) => {
            realtimeComms.publish(discussionTopic, {
                action: "new",
                data: {...data, resource: `${isNew ? "discussion_topics" : "replies"}`}
            });
            notify(isNew ? "Topic posted successfully" : "Reply posted successfully", { type: "success" });
            refreshFn();
            setSaving(false);
            closeDialog();
        };

        const onError = (e: any) => {
            notify(`Error: ${e.message}`, { type: "error" });
            setSaving(false);
        };

        if (isNew) {
            const topicPayload = {
                topic: data.response,
                created_by_user_id: currentUserId,
                created_date: timestamp,
                ...{...record.referencesData}
            };

            create("discussion_topics", { data: topicPayload }, { onSuccess, onError });
        } else {
            const replyPayload = {
                discussion_topic_id: record.topicId,
                reply: data.response,
                replied_date: timestamp,
                replied_by_user_id: currentUserId,
            };

            create("replies", { data: replyPayload }, { onSuccess, onError });
        }
    };

    return (
        <Box>
            <Typography variant="h6">
                {isNew ? "Post Topic" : "Post Topic Reply"}
            </Typography>
            <SimpleForm
                onSubmit={handleSubmit}
                toolbar={
                    <Toolbar>
                        <SaveButton
                            label="Post"
                            icon={<Send />}
                            loading={saving}
                        />
                    </Toolbar>
                }
            >
                <TextInput
                    multiline
                    validate={required()}
                    source="response"
                    minRows={3}
                    label={isNew ? "Topic" : "Reply"}
                    readOnly={saving}
                    fullWidth
                />
            </SimpleForm>
        </Box>
    );
};

export default DiscussionPostCreate;
