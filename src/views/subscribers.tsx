import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { People } from '@mui/icons-material';
import {
    Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, ReferenceField
} from "react-admin";
import { SubscribablesReferenceField, SubscribablesReferenceInput } from './subscribables.js';
import { isSuperAdmin } from '../businessLogic.js';
import {formatDateWithShortYear} from "../utils.ts";
import {CurriculumsReferenceField} from "./curriculums.tsx";

export const RESOURCE = "subscribers"
export const ICON = People
export const PREFETCH: string[] = ["subscribables"]

export const SubscribersReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const SubscribersReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const subscribersActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="subscribable_id" reference="subscribables" label="Subscribable" />,
    <DateLiveFilter source="start_date" label="Start" />,
    <DateLiveFilter source="end_date" label="End" />
]

export const SubscribersList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col label="Curriculum" field={() =>
                    <SubscribablesReferenceField source="subscribable_id" link={false}>
                        <CurriculumsReferenceField source='curriculum_id' link={false} />
                    </SubscribablesReferenceField>
                } />
                { isSuperAdmin() && <DataTable.Col label="Publisher" field={() =>
                    <SubscribablesReferenceField source="subscribable_id">
                        <ReferenceField reference="tenants" source="publisher_tenant_id" label="Publisher" link={false} />
                    </SubscribablesReferenceField>}
                />}
                <DataTable.Col label="Subscriber" field={() =>
                    <ReferenceField reference="tenants" source="subscriber_tenant_id" link={false} />} />
                <DataTable.Col source="subscription_type"  label="Subscription Type" />
                <DataTable.Col label="Start Date" render={(record: any) => formatDateWithShortYear(record.start_date)} />
                <DataTable.Col label="End Date" render={(record: any) => formatDateWithShortYear(record.end_date)} />
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
    subscriber_tenant_id: {},
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
