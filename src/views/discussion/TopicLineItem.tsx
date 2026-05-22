import { useState, useEffect } from "react";
import { Typography, Tooltip } from "@mui/material";
import { dataProvider, remoteLog } from "@mahaswami/vc-frontend";
import { getUserId } from "../../backend/common_logics";

type TopicLineItemProps = {
    text: string;
    topicId: number | string;
    refreshKey: number;
    topicRefreshKey: number;
}

const TopicLineItem: React.FC<TopicLineItemProps> = ({
    text,
    topicId,
    refreshKey,
    topicRefreshKey
}) => {
    const [isUnreadExists, setIsUnreadExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const currentUserId = getUserId();

    useEffect(() => {
        const fetchReadStatus = async () => {
            try {
                const { data } = await dataProvider.getList("discussion_read_status", {
                    filter: { discussion_topic_id: topicId, user_id: currentUserId },
                    pagination: { page: 1, perPage: 1000 },
                });

                const anyUnread = data.some((d: any) => !d.is_read);
                setIsUnreadExists(anyUnread);
            } catch (error) {
                console.error("Failed to fetch topic read status:", error);
                remoteLog("Error on TopicLineItem fetchReadStatus method: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReadStatus();
    }, [topicId, currentUserId, refreshKey, topicRefreshKey]);

    return (
        <Tooltip title={text}>
            <Typography
                variant="body2"
                color={loading ? "text.secondary" : isUnreadExists ? "text.primary" : "text.secondary"}
                component="div"
                sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: isUnreadExists ? 'bold' : 'normal',
                }}
            >
                {text}
            </Typography>
        </Tooltip>
    );
};

export default TopicLineItem;
