import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, NumberLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Forum } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput, NumberField, NumberInput} from "react-admin";
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';
import { UsersReferenceField, UsersReferenceInput } from './users.js';
import { GamesReferenceField, GamesReferenceInput } from './games.js';

export const RESOURCE = "discussion_topics"
export const ICON = Forum
export const PREFETCH: string[] = ["classes", "created_by_users", "games"]

export const DiscussionTopicsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const DiscussionTopicsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const discussionTopicsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <ReferenceLiveFilter source="created_by_user_id" reference="created_by_users" label="Created By User" />,
    <DateLiveFilter source="created_date" label="Created" />,
    <BooleanLiveFilter source="is_feedback_requested" label="Feedback Requested" />,
    <NumberLiveFilter source="move_number" label="Move" />,
    <ReferenceLiveFilter source="game_id" reference="games" label="Game" />
]

export const DiscussionTopicsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['is_feedback_requested', 'move_number', 'game_id']} >
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="created_by_user_id" field={UsersReferenceField}/>
                <DataTable.Col source="created_date" field={DateField}/>
                <DataTable.Col source="topic" />
                <DataTable.Col source="feedback_status" />
                <DataTable.Col source="is_feedback_requested" field={BooleanField}/>
                <DataTable.Col source="move_number" field={NumberField}/>
                <DataTable.Col source="game_id" field={GamesReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const DiscussionTopicsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<ClassesReferenceField source="class_id" variant='h6' link={false} />}>
                <UsersReferenceField source="created_by_user_id" />
                <DateField source="created_date" />
            </CardGrid>
        </List>
    )
}

const DiscussionTopicForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <ClassesReferenceInput source="class_id" />
            <UsersReferenceInput source="created_by_user_id" />
            <DateInput source="created_date" />
            <TextInput source="topic" />
            <TextInput source="feedback_status" />
            <BooleanInput source="is_feedback_requested" />
            <NumberInput source="move_number" />
            <GamesReferenceInput source="game_id" />
        </SimpleForm>
    )
}

const DiscussionTopicEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <DiscussionTopicForm />
        </Edit>
    )
}

const DiscussionTopicCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <DiscussionTopicForm />
        </Create>
    )
}

const DiscussionTopicShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <ClassesReferenceField source="class_id" />
                <UsersReferenceField source="created_by_user_id" />
                <DateField source="created_date" />
                <TextField source="topic" />
                <TextField source="feedback_status" />
                <BooleanField source="is_feedback_requested" />
                <NumberField source="move_number" />
                <GamesReferenceField source="game_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const discussionTopicsFieldSchema: FieldSchema = {
    class_id: { resource: 'classes' },
    created_by_user_id: { resource: 'created_by_users' },
    created_date: {},
    topic: {},
    feedback_status: {},
    is_feedback_requested: {},
    move_number: {},
    game_id: { resource: 'games' }
};
const discussionTopicsSearchableFields: string[] = [
    'topic',
    'feedback_status'
];

export const DiscussionTopicsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('classes', record.class)}
        fieldSchema={ discussionTopicsFieldSchema}
        actionDefs={ discussionTopicsActionDefs}
        searchableFields={ discussionTopicsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<DiscussionTopicsList/>}
        create={<DiscussionTopicCreate/>}
        edit={<DiscussionTopicEdit/>}
        show={<DiscussionTopicShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<DiscussionTopicsCardList/>}
        hasColumnChooser
        sort={{ field: 'topic', order: 'ASC' }}
    />
)
export const DiscussionTopicsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Discussion Topics" leftIcon={<ICON />} />
)
