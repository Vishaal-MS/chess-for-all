import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Category } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput} from "react-admin";
import { SubscribablesReferenceField, SubscribablesReferenceInput } from './subscribables.js';
import { UsersReferenceField, UsersReferenceInput } from './users.js';

export const RESOURCE = "reviews"
export const ICON = Category
export const PREFETCH: string[] = ["subscribables", "users", "subscriber_tenants", "publisher_tenants"]

export const ReviewsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ReviewsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const reviewsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="subscribable_id" reference="subscribables" label="Subscribable" />,
    <DateLiveFilter source="review_date" label="Review" />,
    <ReferenceLiveFilter source="user_id" reference="users" label="User" />,
    <BooleanLiveFilter source="is_read" label="Read" />,
    <ReferenceLiveFilter source="subscriber_tenant_id" reference="subscriber_tenants" label="Subscriber Tenant" />,
    <ReferenceLiveFilter source="publisher_tenant_id" reference="publisher_tenants" label="Publisher Tenant" />
]

export const ReviewsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['rating', 'is_read', 'subscriber_tenant_id', 'publisher_tenant_id']} >
                <DataTable.Col source="subscribable_id" field={SubscribablesReferenceField}/>
                <DataTable.Col source="review_date" field={DateField}/>
                <DataTable.Col source="user_id" field={UsersReferenceField}/>
                <DataTable.Col source="title" />
                <DataTable.Col source="review" />
                <DataTable.Col source="rating" />
                <DataTable.Col source="is_read" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const ReviewsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<SubscribablesReferenceField source="subscribable_id" variant='h6' link={false} />}>
                <DateField source="review_date" />
                <UsersReferenceField source="user_id" />
            </CardGrid>
        </List>
    )
}

const ReviewForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <SubscribablesReferenceInput source="subscribable_id" />
            <DateInput source="review_date" />
            <UsersReferenceInput source="user_id" />
            <TextInput source="title" />
            <TextInput source="review" />
            <TextInput source="rating" />
            <BooleanInput source="is_read" />
        </SimpleForm>
    )
}

const ReviewEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <ReviewForm />
        </Edit>
    )
}

const ReviewCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <ReviewForm />
        </Create>
    )
}

const ReviewShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <SubscribablesReferenceField source="subscribable_id" />
                <DateField source="review_date" />
                <UsersReferenceField source="user_id" />
                <TextField source="title" />
                <TextField source="review" />
                <TextField source="rating" />
                <BooleanField source="is_read" />
            </SimpleShowLayout>
        </Show>
    )
}

const reviewsFieldSchema: FieldSchema = {
    subscribable_id: { resource: 'subscribables' },
    review_date: {},
    user_id: { resource: 'users' },
    title: {},
    review: {},
    rating: {},
    is_read: {},
    subscriber_tenant_id: { resource: 'subscriber_tenants' },
    publisher_tenant_id: { resource: 'publisher_tenants' }
};
const reviewsSearchableFields: string[] = [
    'title',
    'review',
    'rating'
];

export const ReviewsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ reviewsFieldSchema}
        actionDefs={ reviewsActionDefs}
        searchableFields={ reviewsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ReviewsList/>}
        create={<ReviewCreate/>}
        edit={<ReviewEdit/>}
        show={<ReviewShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<ReviewsCardList/>}
        hasColumnChooser
        sort={{ field: 'title', order: 'ASC' }}
    />
)
export const ReviewsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Reviews" leftIcon={<ICON />} />
)
