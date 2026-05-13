import {useNotify, useRecordContext, useRefresh} from "react-admin";
import {useState} from "react";
import {getFeedbackCompletedTemplate, getFeedbackRequestTemplate} from "../../helpers/emailTemplates.ts";
import {isCoach, sendEmail} from "../../businessLogic.ts";
import {FeedbackStatus} from "../../helpers/constants.ts";
import {remoteLog} from "@mahaswami/vc-frontend";
import {Feedback, Grading} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";

const ACTIONS = {
    REQUEST_FEEDBACK: "request_feedback",
    FEEDBACK_PENDING: "feedback_pending",
    FEEDBACK_GIVEN: "feedback_given",
    MARK_AS_FEEDBACK_GIVEN: "mark_as_feedback_given",
};

const LABELS = {
    [ACTIONS.REQUEST_FEEDBACK]: "Request Feedback?",
    [ACTIONS.FEEDBACK_PENDING]: "Feedback Pending",
    [ACTIONS.FEEDBACK_GIVEN]: "Feedback Given",
    [ACTIONS.MARK_AS_FEEDBACK_GIVEN]: "Mark As Feedback Given",
};

export const FeedbackHeaderActions = ({discussionTopic, move}: { discussionTopic: any, move: number }) => {
    const isCoachView = isCoach();

    return (
        <>
            {isCoachView
                ? <CoachFeedbackActions discussionTopic={discussionTopic} move={move}/>
                : <StudentFeedbackActions discussionTopic={discussionTopic} move={move}/>
            }
        </>
    );
};

export const CoachFeedbackActions = ({discussionTopic, move}: { discussionTopic: any; move: number }) => {
    const isFeedbackPending = discussionTopic?.feedback_status === FeedbackStatus.PENDING;

    if (!isFeedbackPending) {
        return null;
    }

    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [loading, setLoading] = useState(false);
    const dataProvider = (window as any).swanAppFunctions.dataProvider;

    const handleFeedbackRequest = async () => {
        setLoading(true);
        const classData = record?.class;

        try {
            const studentIds = [record?.player1_student_id, record?.player2_student_id].filter(Boolean);

            if (studentIds.length === 0) {
                notify("Student not found", {type: "error"});
                remoteLog("Student not found to send feedback given notification");
                return;
            }

            const {data: students} = await dataProvider.getList("students", {
                filter: {id: studentIds},
                meta: {prefetch: ["users"]},
            });

            await Promise.all(
                students.map((student: any) => {
                    const messageTemplate = getFeedbackCompletedTemplate(
                        student.user.fullName,
                        classData.name,
                        record?.event,
                        move
                    );
                    return sendEmail({
                        to: student.user.email,
                        ...messageTemplate,
                    });
                })
            );

            await dataProvider.update("discussion_topics", {
                id: discussionTopic?.id,
                data: {feedback_status: FeedbackStatus.GIVEN},
            });

            const {data: discussionTopics} = await dataProvider.getList("discussion_topics", {
                filter: {is_feedback_requested: true, game_id: record?.id},
            });

            if (!discussionTopics.some((d: any) => d?.feedback_status === FeedbackStatus.PENDING)) {
                await dataProvider.update("games", {
                    id: record?.id,
                    data: {feedback_status: FeedbackStatus.GIVEN},
                });
            }

            notify("Feedback marked as completed", {type: "success"});
            refresh();
        } catch (error) {
            console.error("Error: Feedback marked as completed", error);
            remoteLog("Error: Feedback marked as completed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip title={LABELS[ACTIONS.MARK_AS_FEEDBACK_GIVEN]}>
            <span>
                <IconButton
                    color="inherit"
                    onClick={handleFeedbackRequest}
                    sx={{cursor: "pointer", pl: 0}}
                    disabled={loading}
                >
                    <Grading/>
                </IconButton>
            </span>
        </Tooltip>
    );
};

export const StudentFeedbackActions = ({discussionTopic, move}: { discussionTopic: any, move: number, }) => {
    const isFeedbackRequested = discussionTopic?.is_feedback_requested === true;

    if (isFeedbackRequested) {
        return null;
    }

    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [loading, setLoading] = useState(false);

    const dataProvider = (window as any).swanAppFunctions.dataProvider;

    const handleFeedbackRequest = async () => {
        setLoading(true);
        try {
            const classData = record?.class;

            const {data: coach} = await dataProvider.getOne("coaches", {
                id: classData.coach_id,
                meta: {prefetch: ["users"]},
            });

            const messageTemplate = getFeedbackRequestTemplate(
                coach.user.fullName,
                classData.name,
                record?.event,
                move
            );

            await sendEmail({
                to: coach.user.email,
                ...messageTemplate,
            });

            await Promise.all([
                dataProvider.update("games", {
                    id: record?.id,
                    data: {
                        feedback_status: FeedbackStatus.PENDING,
                        is_feedback_requested: true,
                    },
                }),
                dataProvider.update("discussion_topics", {
                    id: discussionTopic?.id,
                    data: {
                        feedback_status: FeedbackStatus.PENDING,
                        is_feedback_requested: true,
                    },
                }),
            ]);

            notify("Feedback requested successfully", {type: "success"});
            refresh();
        } catch (error) {
            console.error("Error: Feedback requested", error);
            remoteLog("Error: Feedback requested", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip title={LABELS[ACTIONS.REQUEST_FEEDBACK]}>
            <span>
                <IconButton
                    color="inherit"
                    onClick={handleFeedbackRequest}
                    sx={{cursor: "pointer", pl: 0}}
                    disabled={loading}
                >
                    <Feedback/>
                </IconButton>
            </span>
        </Tooltip>
    );
};
