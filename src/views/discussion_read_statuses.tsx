import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Visibility } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, DateField, DateInput, BooleanField, BooleanInput} from "react-admin";
import { UsersReferenceField, UsersReferenceInput } from './users.js';
import { DiscussionTopicsReferenceField, DiscussionTopicsReferenceInput } from './discussion_topics.js';
import { RepliesReferenceField, RepliesReferenceInput } from './replies.js';

export const RESOURCE = "discussion_read_statuses"
export const ICON = Visibility
export const PREFETCH: string[] = ["users", "discussion_topics", "replies"]

export const DiscussionReadStatusesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const DiscussionReadStatusesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const discussionReadStatusesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="user_id" reference="users" label="User" />,
    <ReferenceLiveFilter source="discussion_topic_id" reference="discussion_topics" label="Discussion Topic" />,
    <ReferenceLiveFilter source="reply_id" reference="replies" label="Reply" />,
    <BooleanLiveFilter source="is_read" label="Read" />,
    <DateLiveFilter source="read_date" label="Read" />
]

export const DiscussionReadStatusesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="user_id" field={UsersReferenceField}/>
                <DataTable.Col source="discussion_topic_id" field={DiscussionTopicsReferenceField}/>
                <DataTable.Col source="reply_id" field={RepliesReferenceField}/>
                <DataTable.Col source="is_read" field={BooleanField}/>
                <DataTable.Col source="read_date" field={DateField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const DiscussionReadStatusesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<UsersReferenceField source="user_id" variant='h6' link={false} />}>
                <DiscussionTopicsReferenceField source="discussion_topic_id" />
                <RepliesReferenceField source="reply_id" />
            </CardGrid>
        </List>
    )
}

const DiscussionReadStatusForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <UsersReferenceInput source="user_id" />
            <DiscussionTopicsReferenceInput source="discussion_topic_id" />
            <RepliesReferenceInput source="reply_id" />
            <BooleanInput source="is_read" />
            <DateInput source="read_date" />
        </SimpleForm>
    )
}

const DiscussionReadStatusEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <DiscussionReadStatusForm />
        </Edit>
    )
}

const DiscussionReadStatusCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <DiscussionReadStatusForm />
        </Create>
    )
}

const DiscussionReadStatusShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <UsersReferenceField source="user_id" />
                <DiscussionTopicsReferenceField source="discussion_topic_id" />
                <RepliesReferenceField source="reply_id" />
                <BooleanField source="is_read" />
                <DateField source="read_date" />
            </SimpleShowLayout>
        </Show>
    )
}

const discussionReadStatusesFieldSchema: FieldSchema = {
    user_id: { resource: 'users' },
    discussion_topic_id: { resource: 'discussion_topics' },
    reply_id: { resource: 'replies' },
    is_read: {},
    read_date: {}
};
const discussionReadStatusesSearchableFields: string[] = [];

export const DiscussionReadStatusesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('users', record.user)}
        fieldSchema={ discussionReadStatusesFieldSchema}
        actionDefs={ discussionReadStatusesActionDefs}
        searchableFields={ discussionReadStatusesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<DiscussionReadStatusesList/>}
        create={<DiscussionReadStatusCreate/>}
        edit={<DiscussionReadStatusEdit/>}
        show={<DiscussionReadStatusShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<DiscussionReadStatusesCardList/>}
    />
)
export const DiscussionReadStatusesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Discussion Read Statuses" leftIcon={<ICON />} />
)
