import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Receipt } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput} from "react-admin";
import { SubscriptionsReferenceField, SubscriptionsReferenceInput } from './subscriptions.js';

export const RESOURCE = "subscription_invoices"
export const ICON = Receipt
export const PREFETCH: string[] = ["subscriptions"]

export const SubscriptionInvoicesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const SubscriptionInvoicesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const subscriptionInvoicesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="subscription_id" reference="subscriptions" label="Subscription" />,
    <DateLiveFilter source="invoice_date" label="Invoice" />
]

export const SubscriptionInvoicesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="subscription_id" field={SubscriptionsReferenceField}/>
                <DataTable.Col source="invoice_date" field={DateField}/>
                <DataTable.Col source="amount" />
                <DataTable.Col source="status" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const SubscriptionInvoicesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<SubscriptionsReferenceField source="subscription_id" variant='h6' link={false} />}>
                <DateField source="invoice_date" />
                <TextField source="amount" />
            </CardGrid>
        </List>
    )
}

const SubscriptionInvoiceForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <SubscriptionsReferenceInput source="subscription_id" />
            <DateInput source="invoice_date" />
            <TextInput source="amount" />
            <TextInput source="status" />
        </SimpleForm>
    )
}

const SubscriptionInvoiceEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <SubscriptionInvoiceForm />
        </Edit>
    )
}

const SubscriptionInvoiceCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <SubscriptionInvoiceForm />
        </Create>
    )
}

const SubscriptionInvoiceShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <SubscriptionsReferenceField source="subscription_id" />
                <DateField source="invoice_date" />
                <TextField source="amount" />
                <TextField source="status" />
            </SimpleShowLayout>
        </Show>
    )
}

const subscriptionInvoicesFieldSchema: FieldSchema = {
    subscription_id: { resource: 'subscriptions' },
    invoice_date: {},
    amount: {},
    status: {}
};
const subscriptionInvoicesSearchableFields: string[] = [
    'amount',
    'status'
];

export const SubscriptionInvoicesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('subscriptions', record.subscription)}
        fieldSchema={ subscriptionInvoicesFieldSchema}
        actionDefs={ subscriptionInvoicesActionDefs}
        searchableFields={ subscriptionInvoicesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<SubscriptionInvoicesList/>}
        create={<SubscriptionInvoiceCreate/>}
        edit={<SubscriptionInvoiceEdit/>}
        show={<SubscriptionInvoiceShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<SubscriptionInvoicesCardList/>}
        sort={{ field: 'amount', order: 'ASC' }}
    />
)
export const SubscriptionInvoicesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Subscription Invoices" leftIcon={<ICON />} />
)
