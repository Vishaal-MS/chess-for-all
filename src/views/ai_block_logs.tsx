import {
    Resource,
    type ResourceActionDefs,
    type FieldSchema,
    createReferenceField,
    createReferenceInput,
    BooleanLiveFilter,
    ReferenceLiveFilter,
    DateLiveFilter,
    TextLiveFilter
} from '@mahaswami/vc-frontend';
import { Description } from '@mui/icons-material';
import { Menu } from "react-admin";
import {AiBlockLogShow} from "./ai_block_logs/AiBlockLogShow.tsx";
import {AiBlockLogsList} from "./ai_block_logs/AiBlockLogList.tsx";

export const RESOURCE = "ai_block_logs"
export const ICON = Description
export const PREFETCH: string[] = ["users", "divisions", "lesson_blocks"]

export const AiBlockLogsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const AiBlockLogsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const aiBlockLogsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <DateLiveFilter source="log_timestamp" label="Log Timestamp" />,
    <BooleanLiveFilter source="is_ai_error" label="Ai Error" />,
    <BooleanLiveFilter source="is_archived" label="Archived" />,
    <ReferenceLiveFilter source="user_id" reference="users" label="User" />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />,
    <ReferenceLiveFilter source="lesson_block_id" reference="lesson_blocks" label="Lesson Block" />
]

const aiBlockLogsFieldSchema: FieldSchema = {
    log_timestamp: {},
    user_command: {},
    ai_response: {},
    feedback_text: {},
    feedback_status: {},
    notes: {},
    is_ai_error: {},
    stack_trace: {},
    is_archived: {},
    user_id: { resource: 'users' },
    division_id: { resource: 'divisions' },
    name: {},
    lesson_block_id: { resource: 'lesson_blocks' },
    ai_usage: {}
};
const aiBlockLogsSearchableFields: string[] = [
    'name',
    'user_command',
    'ai_response',
    'feedback_text',
    'feedback_status',
    'notes',
    'stack_trace',
    'ai_usage'
];

export const AiBlockLogsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ aiBlockLogsFieldSchema}
        actionDefs={ aiBlockLogsActionDefs}
        searchableFields={ aiBlockLogsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<AiBlockLogsList/>}
        show={<AiBlockLogShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const AiBlockLogsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Ai Block Logs" leftIcon={<ICON />} />
)
