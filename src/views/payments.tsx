import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Payment } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput} from "react-admin";
import { InvoicesReferenceField, InvoicesReferenceInput } from './invoices.js';
import { CoachesReferenceField, CoachesReferenceInput } from './coaches.js';
import { ClientsReferenceField, ClientsReferenceInput } from './clients.js';
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';

export const RESOURCE = "payments"
export const ICON = Payment
export const PREFETCH: string[] = ["invoices", "coaches", "clients", "classes"]

export const PaymentsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const PaymentsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const paymentsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="invoice_id" reference="invoices" label="Invoice" />,
    <ReferenceLiveFilter source="coach_id" reference="coaches" label="Coach" />,
    <ReferenceLiveFilter source="client_id" reference="clients" label="Client" />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />
]

export const PaymentsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['amount']} >
                <DataTable.Col source="invoice_id" field={InvoicesReferenceField}/>
                <DataTable.Col source="coach_id" field={CoachesReferenceField}/>
                <DataTable.Col source="client_id" field={ClientsReferenceField}/>
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="date" />
                <DataTable.Col source="amount" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const PaymentsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<InvoicesReferenceField source="invoice_id" variant='h6' link={false} />}>
                <CoachesReferenceField source="coach_id" />
                <ClientsReferenceField source="client_id" />
            </CardGrid>
        </List>
    )
}

const PaymentForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <InvoicesReferenceInput source="invoice_id" />
            <CoachesReferenceInput source="coach_id" />
            <ClientsReferenceInput source="client_id" />
            <ClassesReferenceInput source="class_id" />
            <TextInput source="date" />
            <TextInput source="amount" />
        </SimpleForm>
    )
}

const PaymentEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <PaymentForm />
        </Edit>
    )
}

const PaymentCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <PaymentForm />
        </Create>
    )
}

const PaymentShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <InvoicesReferenceField source="invoice_id" />
                <CoachesReferenceField source="coach_id" />
                <ClientsReferenceField source="client_id" />
                <ClassesReferenceField source="class_id" />
                <TextField source="date" />
                <TextField source="amount" />
            </SimpleShowLayout>
        </Show>
    )
}

const paymentsFieldSchema: FieldSchema = {
    invoice_id: { resource: 'invoices' },
    coach_id: { resource: 'coaches' },
    client_id: { resource: 'clients' },
    class_id: { resource: 'classes' },
    date: {},
    amount: {}
};
const paymentsSearchableFields: string[] = [
    'date',
    'amount'
];

export const PaymentsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('invoices', record.invoice)}
        fieldSchema={ paymentsFieldSchema}
        actionDefs={ paymentsActionDefs}
        searchableFields={ paymentsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<PaymentsList/>}
        create={<PaymentCreate/>}
        edit={<PaymentEdit/>}
        show={<PaymentShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<PaymentsCardList/>}
        hasColumnChooser
        sort={{ field: 'date', order: 'ASC' }}
    />
)
export const PaymentsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Payments" leftIcon={<ICON />} />
)
