import { Resource, editDefaults, formDefaults, listDefaults, showDefaults, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField,
    createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { Subscriptions } from '@mui/icons-material';
import {
    Edit, List, Menu, Show,
    type ListProps, DateField, DateInput
} from "react-admin";
import { SubscribablesReferenceField, SubscribablesReferenceInput } from './subscribables.js';
import { DivisionsReferenceField, DivisionsReferenceInput } from './divisions.js';
import {SubscriptionsList} from "./subscriptions/subscriptions.tsx";

export const RESOURCE = "subscriptions"
export const ICON = Subscriptions
export const PREFETCH: string[] = ["subscribables"]

export const SubscriptionsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const SubscriptionsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const subscriptionsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="subscribable_id" reference="subscribables" label="Subscribable" />,
    <DateLiveFilter source="start_date" label="Start" />,
    <DateLiveFilter source="end_date" label="End" />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />
]

export const SubscriptionsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<SubscribablesReferenceField source="subscribable_id" variant='h6' link={false} />}>
                <DateField source="start_date" />
            </CardGrid>
        </List>
    )
}

const SubscriptionForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <SubscribablesReferenceInput source="subscribable_id" />
            <DateInput source="start_date" />
            <DateInput source="end_date" />
            <DivisionsReferenceInput source="division_id" />
        </SimpleForm>
    )
}

const SubscriptionEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <SubscriptionForm />
        </Edit>
    )
}

const SubscriptionShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <SubscribablesReferenceField source="subscribable_id" />
                <DateField source="start_date" />
                <DateField source="end_date" />
                <DivisionsReferenceField source="division_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const subscriptionsFieldSchema: FieldSchema = {
    subscribable_id: { resource: 'subscribables' },
    subscriber_tenant_id: {},
    start_date: {},
    end_date: {},
    division_id: { resource: 'divisions' }
};
const subscriptionsSearchableFields: string[] = [];

export const SubscriptionsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('subscribables', record.subscribable)}
        fieldSchema={ subscriptionsFieldSchema}
        actionDefs={ subscriptionsActionDefs}
        searchableFields={ subscriptionsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<SubscriptionsList/>}
        edit={<SubscriptionEdit/>}
        show={<SubscriptionShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<SubscriptionsCardList/>}
    />
)
export const SubscriptionsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Subscribed Curriculums" leftIcon={<ICON />} />
)
