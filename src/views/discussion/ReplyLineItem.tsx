import { useState, useEffect } from "react";
import { Typography, Link } from "@mui/material";
import { dataProvider, remoteLog } from "@mahaswami/vc-frontend";
import { getUserId } from "../../backend/common_logics";

type ReplyLineItemProps = {
    text: string,
    replyId: number | string,
    refreshKey: number
}

const ReplyLineItem = ({ text, replyId, refreshKey }: ReplyLineItemProps) => {
    const [expanded, setExpanded] = useState(false);
    const [isRead, setIsRead] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);

    const currentUserId = getUserId();
    const isLong = text.length > 110;
    const displayText = expanded || !isLong ? text : text.slice(0, 110) + "...";

    const toggleExpand = () => setExpanded((prev) => !prev);

    useEffect(() => {
        const fetchReadStatus = async () => {
            try {
                const { data } = await dataProvider.getList("discussion_read_status", {
                    filter: { reply_id: replyId, user_id: currentUserId },
                    pagination: { page: 1, perPage: 1 },
                });
                if (data.length > 0) {
                    setIsRead(data[0].is_read);
                }
            } catch (error) {
                console.error("Failed to fetch read status", error);
                remoteLog("Error on ReplylineItem fetchReadStatus method: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReadStatus();
    }, [replyId, currentUserId, refreshKey]);

    return (
        <Typography
            fontSize="0.75rem"
            color={loading ? "text.secondary" : isRead ? "text.secondary" : "text.primary"}
            fontWeight={isRead ? 'normal' : 'bold'}
            mt={0.5}
            ml={1}
        >
            {displayText}{" "}
            {isLong && (
                <Link component="button" onClick={toggleExpand} sx={{ fontSize: "0.65rem" }}>
                    {expanded ? "Read less" : "Read more"}
                </Link>
            )}
        </Typography>
    );
};

export default ReplyLineItem;
