import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Comment } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput} from "react-admin";
import { DiscussionTopicsReferenceField, DiscussionTopicsReferenceInput } from './discussion_topics.js';
import {UsersReferenceField, UsersReferenceInput} from "./users.tsx";

export const RESOURCE = "replies"
export const ICON = Comment
export const PREFETCH: string[] = ["discussion_topics", "replied_by_users"]

export const RepliesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const RepliesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const repliesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="discussion_topic_id" reference="discussion_topics" label="Discussion Topic" />,
    <DateLiveFilter source="replied_date" label="Replied" />,
    <ReferenceLiveFilter source="replied_by_user_id" reference="replied_by_users" label="Replied By User" />
]

export const RepliesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="discussion_topic_id" field={DiscussionTopicsReferenceField}/>
                <DataTable.Col source="reply" />
                <DataTable.Col source="replied_date" field={DateField}/>
                <DataTable.Col source="replied_by_user_id" field={UsersReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const RepliesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<DiscussionTopicsReferenceField source="discussion_topic_id" variant='h6' link={false} />}>
                <TextField source="reply" />
                <DateField source="replied_date" />
            </CardGrid>
        </List>
    )
}

const ReplyForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <DiscussionTopicsReferenceInput source="discussion_topic_id" />
            <TextInput source="reply" />
            <DateInput source="replied_date" />
            <UsersReferenceInput source="replied_by_user_id" />
        </SimpleForm>
    )
}

const ReplyEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <ReplyForm />
        </Edit>
    )
}

const ReplyCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <ReplyForm />
        </Create>
    )
}

const ReplyShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <DiscussionTopicsReferenceField source="discussion_topic_id" />
                <TextField source="reply" />
                <DateField source="replied_date" />
                <UsersReferenceField source="replied_by_user_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const repliesFieldSchema: FieldSchema = {
    discussion_topic_id: { resource: 'discussion_topics' },
    reply: {},
    replied_date: {},
    replied_by_user_id: { resource: 'replied_by_users' }
};
const repliesSearchableFields: string[] = [
    'reply'
];

export const RepliesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('discussion_topics', record.discussion_topic)}
        fieldSchema={ repliesFieldSchema}
        actionDefs={ repliesActionDefs}
        searchableFields={ repliesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<RepliesList/>}
        create={<ReplyCreate/>}
        edit={<ReplyEdit/>}
        show={<ReplyShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<RepliesCardList/>}
        sort={{ field: 'reply', order: 'ASC' }}
    />
)
export const RepliesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Replies" leftIcon={<ICON />} />
)
