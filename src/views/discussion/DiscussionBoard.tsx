import { openDialog, useRealtimeComms } from '@mahaswami/vc-frontend';
import { Add, MarkChatRead, Reply, School } from '@mui/icons-material';
import {
    Box,
    Card,
    CardHeader,
    IconButton,
    Tooltip,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
    FunctionField,
    Loading,
    ReferenceManyField,
    useListContext,
    useRefresh
} from 'react-admin';
import {getUserId} from '../../businessLogic';
import { Empty } from '../common/empty';
import DiscussionPostCreate from './DiscussionPostCreate';
import ReplyLineItem from './ReplyLineItem';
import TopicLineItem from './TopicLineItem';
import {updateDiscussionReadStatus} from "../../backend/classes.ts";
import {formatDateWithShortYear} from "../../utils.ts";
import { AvatarField } from '../../fields/AvatarField.tsx';
import {UsersReferenceField} from "../users.tsx";

const cardHeaderSx = (theme) => ({
    p: 0,
    justifyContent: 'center',
    display: 'flex',
    textAlign: 'center',
    background: `linear-gradient(45deg, 
      ${theme.palette.secondary.dark} 0%, 
      ${theme.palette.secondary.light} 50%, 
      ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    minHeight: 40,
});

const Replies = ({ topicId, record, refreshKey }) => (
    <ReferenceManyField record={record}
        reference="replies"
        target="discussion_topic_id"
        filter={{ discussion_topic_id: topicId }}
        sort={{ field: 'replied_date', order: 'ASC' }}
    >
        <RepliesList refreshKey={refreshKey} />
    </ReferenceManyField>
);

const RepliesList = ({ refreshKey }: { refreshKey: number }) => {
    const { data, total } = useListContext();

    if (!data || total === 0) return undefined;

    return (
        <Box sx={{ pl: 1.5 }}>
            {data.map((record) => (
                <Box
                    key={record.id}
                    sx={{
                        mb: 0.5,
                        p: 1, pb: 0.5,
                        borderRadius: 1,
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
                    }}
                >
                    <UsersReferenceField source="replied_by_user_id" record={record} link={false}>
                        <FunctionField render={(user: any) => (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AvatarField /> 
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                    {user.fullName}
                                    {user.role?.toLowerCase().includes('coach') && (
                                        <School sx={{ fontSize: '14px' }} color='success' />
                                    )}
                                    {/*<DateField*/}
                                    {/*    options={{ year: '2-digit', month: '2-digit', day: '2-digit' }}*/}
                                    {/*    record={record} source="replied_date" />*/}
                                    {formatDateWithShortYear(record.replied_date)}
                                </Typography>
                            </Box>
                        )} />
                    </UsersReferenceField>
                    <ReplyLineItem text={record.reply} replyId={record.id} refreshKey={refreshKey} />
                </Box>
            ))}
        </Box>
    );
};

const TopicList = ({ data, onReply, topicRefreshKey }) => {
    const [refreshKey, setRefreshKey] = useState(Date.now());
    const refresh = useRefresh();
    const currentUserId = getUserId();
    const dataProvider = window.swanAppFunctions.dataProvider;
    const handleMarhAsRead = async (topicId: number) => {
        await updateDiscussionReadStatus(dataProvider,topicId,currentUserId);
        refresh();
        setRefreshKey(Date.now());
    }

    if (!data || data.length === 0) return <Empty showIcon={false} emptyText="No discussions yet" />;

    return (
        <>
            {data.map((record) => (
                <Box
                    key={record.id}
                    sx={{
                        mt: 1, mx: 1, p: 0.75, pb: 0.5,
                        borderRadius: 1,
                        boxShadow: 1,
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                        }}
                    >
                        <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', gap: 0.5 }}>
                            <UsersReferenceField source="created_by_user_id" record={record} reference="users" link={false}>
                                <FunctionField render={(user: any) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AvatarField/>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ display: 'flex', whiteSpace: "nowrap", alignItems: 'center', gap: 0.5, ml: 1 }}
                                        >
                                            {user.fullName}
                                            {user.role?.toLowerCase().includes('coach') && (
                                                <School sx={{ fontSize: '14px' }} color="success" />
                                            )}
                                        </Typography>
                                    </Box>
                                )} />
                            </UsersReferenceField>
                            <Box sx={{ display: 'grid', alignItems: 'start', ml: 0.5 }}>
                                <TopicLineItem topicId={record.id} text={record.topic} refreshKey={refreshKey} topicRefreshKey={topicRefreshKey} />
                            </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {formatDateWithShortYear(record.created_date)}
                        </Typography>
                        <Tooltip title="Mark As Read">
                            <IconButton sx={{ p: 0.5 }} color="primary" onClick={() => handleMarhAsRead(record.id)}>
                                <MarkChatRead fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Reply" sx={{ p: 0.5 }}>
                            <IconButton color="primary" onClick={() => onReply(record.id)}>
                                <Reply fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Replies topicId={record.id} record={record} refreshKey={refreshKey} />
                </Box >
            ))}
        </>
    );
};

interface DiscussionBoardProps {
    title?: string;
    emptyText?: string;
    createLabel?: string;
    allowMultipleTopic?: boolean;
    references: {
        ref1: {
            id: number;
            name: string;
        };
        ref2?: {
            id: number;
            name: string;
        };
    };
    cardSx?: any;
    headerActions?: (data: any) => React.ReactNode;
}

const LABELS = {
    TITLE : "Discussion Board",
    EMPTY_TEXT: "No discussions yet",
    CREATE: "Create Discussion"
};

const DiscussionBoard = ({ allowMultipleTopic = true, createLabel, title, emptyText, references, cardSx, headerActions }: DiscussionBoardProps) => {
    const realtimeComms = useRealtimeComms();
    const refresh = useRefresh();
    const [topicRefreshKey, setTopicRefreshKey] = useState(Date.now());
    const [state, setState] = useState({loading: true, discussionTopics: []});

    const discussionTopic = `discussion_topics/${references.ref1.id}`
    let referencesData = {[references.ref1.name] : references.ref1.id}
    if(references?.ref2) {
        referencesData = {...referencesData, [references.ref2.name] : references.ref2.id}
    }

    useEffect(() => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const fetchDiscussionTopics = async () => {
            try {
                const {data: discussionTopics} = await dataProvider.getList("discussion_topics", {
                    filter: {...referencesData},
                    sort:{field: 'created_date', order: 'DESC' },
                    pagination:{page:1, perPage: 1000}
                });

                setState(prev => ({...prev, discussionTopics}))

            } catch (error) {
                console.log("ERROR: While Fetching Discussion Topics", error);
            } finally {
                setState(prev => ({...prev, loading: false}));
            }
        }

        fetchDiscussionTopics();

    }, [references]);

    // Realtime data for discussion board. 
    useEffect(() => {
        const handleUpdate = (content, fromUserId, receivedTopic) => {
            setTopicRefreshKey(Date.now()); // To refresh topic after reply posted.
            refresh();
        };

        realtimeComms.subscribe(discussionTopic, handleUpdate);
        return () => {
            realtimeComms.unsubscribe(discussionTopic, handleUpdate);
        };
    }, []);

    const postDiscussionTopic = () => {
        openDialog(
            <DiscussionPostCreate
                record={{
                    referencesData: referencesData,
                }}
                discussionTopic={discussionTopic}
                refreshFn={refresh}
                isNew
            />
        );
    };

    const postTopicReply = (topicId: number) => {
        openDialog(
            <DiscussionPostCreate
                record={{ topicId }}
                refreshFn={refresh}
                discussionTopic={ discussionTopic}
            />
        );
    };

    const {loading, discussionTopics} = state;

    if (loading) {
        return <Loading/>;
    }

    const isShowAddTopicBtn = allowMultipleTopic || !allowMultipleTopic && discussionTopics?.length < 1;

    return (
        <Card sx={{ pb: 1, ...cardSx }}>
            <CardHeader
                title={
                    <Box display="flex" alignItems="center">
                        <Box flex={1} display="flex" justifyContent="center" ml={"2.2rem"}>
                            <Typography variant="h6">{title || LABELS.TITLE}</Typography>
                        </Box>
                        {(isShowAddTopicBtn) &&
                            <Tooltip title={createLabel || LABELS.CREATE}>
                                <IconButton color="inherit" onClick={postDiscussionTopic} sx={{cursor: 'pointer', pl: 0}}>
                                    <Add/>
                                </IconButton>
                            </Tooltip>
                        }
                        {(headerActions && !isShowAddTopicBtn) &&
                            headerActions?.(discussionTopics[0])
                        }
                    </Box>
                }
                sx={cardHeaderSx}
            />
            <Box className='discussion-board' sx={{
                height: "calc(100vh - 115px)",
                scrollbarWidth: 'none',
                overflow: 'auto'
            }}>
                {discussionTopics.length > 0
                    ? <TopicList
                        data={discussionTopics}
                        onReply={postTopicReply}
                        topicRefreshKey={topicRefreshKey}/>
                    : <Box sx={{mt: "1rem"}}><Empty showIcon={false} emptyText={emptyText || LABELS.EMPTY_TEXT}/></Box>
                }
            </Box>
        </Card>
    );
};

export default DiscussionBoard;
