import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { People } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput} from "react-admin";
import { SubscribablesReferenceField, SubscribablesReferenceInput } from './subscribables.js';

export const RESOURCE = "subscribers"
export const ICON = People
export const PREFETCH: string[] = ["subscribables", "subscriber_tenants"]

export const SubscribersReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const SubscribersReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const subscribersActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="subscribable_id" reference="subscribables" label="Subscribable" />,
    <ReferenceLiveFilter source="subscriber_tenant_id" reference="subscriber_tenants" label="Subscriber Tenant" />,
    <DateLiveFilter source="start_date" label="Start" />,
    <DateLiveFilter source="end_date" label="End" />
]

export const SubscribersList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="subscribable_id" field={SubscribablesReferenceField}/>
                <DataTable.Col source="start_date" field={DateField}/>
                <DataTable.Col source="end_date" field={DateField}/>
                <DataTable.Col source="subscription_type" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const SubscribersCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<SubscribablesReferenceField source="subscribable_id" variant='h6' link={false} />}>
                <DateField source="start_date" />
            </CardGrid>
        </List>
    )
}

const SubscriberForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <SubscribablesReferenceInput source="subscribable_id" />
            <DateInput source="start_date" />
            <DateInput source="end_date" />
            <TextInput source="subscription_type" />
        </SimpleForm>
    )
}

const SubscriberEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <SubscriberForm />
        </Edit>
    )
}

const SubscriberCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <SubscriberForm />
        </Create>
    )
}

const SubscriberShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <SubscribablesReferenceField source="subscribable_id" />
                <DateField source="start_date" />
                <DateField source="end_date" />
                <TextField source="subscription_type" />
            </SimpleShowLayout>
        </Show>
    )
}

const subscribersFieldSchema: FieldSchema = {
    subscribable_id: { resource: 'subscribables' },
    subscriber_tenant_id: { resource: 'subscriber_tenants' },
    start_date: {},
    end_date: {},
    subscription_type: {}
};
const subscribersSearchableFields: string[] = [
    'subscription_type'
];

export const SubscribersResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('subscribables', record.subscribable)}
        fieldSchema={ subscribersFieldSchema}
        actionDefs={ subscribersActionDefs}
        searchableFields={ subscribersSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<SubscribersList/>}
        create={<SubscriberCreate/>}
        edit={<SubscriberEdit/>}
        show={<SubscriberShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<SubscribersCardList/>}
        sort={{ field: 'subscription_type', order: 'ASC' }}
    />
)
export const SubscribersMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Subscribers" leftIcon={<ICON />} />
)
