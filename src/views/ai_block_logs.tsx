import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Description } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateTimeInput, BooleanField, BooleanInput} from "react-admin";
import { UsersReferenceField, UsersReferenceInput } from './users.js';
import { DivisionsReferenceField, DivisionsReferenceInput } from './divisions.js';
import { LessonBlocksReferenceField, LessonBlocksReferenceInput } from './lesson_blocks.js';

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

export const AiBlockLogsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['notes', 'is_ai_error', 'stack_trace', 'is_archived', 'user_id', 'division_id', 'name', 'lesson_block_id', 'ai_usage']} >
                <DataTable.Col source="log_timestamp" field={(props: any) => <DateField {...props} showTime />}/>
                <DataTable.Col source="user_command" />
                <DataTable.Col source="ai_response" />
                <DataTable.Col source="feedback_text" />
                <DataTable.Col source="feedback_status" />
                <DataTable.Col source="notes" />
                <DataTable.Col source="is_ai_error" field={BooleanField}/>
                <DataTable.Col source="stack_trace" />
                <DataTable.Col source="is_archived" field={BooleanField}/>
                <DataTable.Col source="user_id" field={UsersReferenceField}/>
                <DataTable.Col source="division_id" field={DivisionsReferenceField}/>
                <DataTable.Col source="name" />
                <DataTable.Col source="lesson_block_id" field={LessonBlocksReferenceField}/>
                <DataTable.Col source="ai_usage" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const AiBlockLogsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<DateField source="log_timestamp" showTime />}>
                <TextField source="user_command" />
                <TextField source="ai_response" />
            </CardGrid>
        </List>
    )
}

const AiBlockLogForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <DateTimeInput source="log_timestamp" />
            <TextInput source="user_command" />
            <TextInput source="ai_response" />
            <TextInput source="feedback_text" />
            <TextInput source="feedback_status" />
            <TextInput source="notes" />
            <BooleanInput source="is_ai_error" />
            <TextInput source="stack_trace" />
            <BooleanInput source="is_archived" />
            <UsersReferenceInput source="user_id" />
            <DivisionsReferenceInput source="division_id" />
            <TextInput source="name" />
            <LessonBlocksReferenceInput source="lesson_block_id" />
            <TextInput source="ai_usage" />
        </SimpleForm>
    )
}

const AiBlockLogEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <AiBlockLogForm />
        </Edit>
    )
}

const AiBlockLogCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <AiBlockLogForm />
        </Create>
    )
}

const AiBlockLogShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <DateField source="log_timestamp" showTime />
                <TextField source="user_command" />
                <TextField source="ai_response" />
                <TextField source="feedback_text" />
                <TextField source="feedback_status" />
                <TextField source="notes" />
                <BooleanField source="is_ai_error" />
                <TextField source="stack_trace" />
                <BooleanField source="is_archived" />
                <UsersReferenceField source="user_id" />
                <DivisionsReferenceField source="division_id" />
                <TextField source="name" />
                <LessonBlocksReferenceField source="lesson_block_id" />
                <TextField source="ai_usage" />
            </SimpleShowLayout>
        </Show>
    )
}

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
        create={<AiBlockLogCreate/>}
        edit={<AiBlockLogEdit/>}
        show={<AiBlockLogShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<AiBlockLogsCardList/>}
        hasColumnChooser
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const AiBlockLogsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Ai Block Logs" leftIcon={<ICON />} />
)
