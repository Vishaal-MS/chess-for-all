import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Receipt } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput} from "react-admin";
import { CoachesReferenceField, CoachesReferenceInput } from './coaches.js';
import { ClientsReferenceField, ClientsReferenceInput } from './clients.js';
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';

export const RESOURCE = "invoices"
export const ICON = Receipt
export const PREFETCH: string[] = ["coaches", "clients", "classes"]

export const InvoicesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const InvoicesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const invoicesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="coach_id" reference="coaches" label="Coach" />,
    <ReferenceLiveFilter source="client_id" reference="clients" label="Client" />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <DateLiveFilter source="invoice_date" label="Invoice" />
]

export const InvoicesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['amount', 'status']} >
                <DataTable.Col source="coach_id" field={CoachesReferenceField}/>
                <DataTable.Col source="client_id" field={ClientsReferenceField}/>
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="invoice_date" field={DateField}/>
                <DataTable.Col source="date" />
                <DataTable.Col source="amount" />
                <DataTable.Col source="status" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const InvoicesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<CoachesReferenceField source="coach_id" variant='h6' link={false} />}>
                <ClientsReferenceField source="client_id" />
                <ClassesReferenceField source="class_id" />
            </CardGrid>
        </List>
    )
}

const InvoiceForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <CoachesReferenceInput source="coach_id" />
            <ClientsReferenceInput source="client_id" />
            <ClassesReferenceInput source="class_id" />
            <DateInput source="invoice_date" />
            <TextInput source="date" />
            <TextInput source="amount" />
            <TextInput source="status" />
        </SimpleForm>
    )
}

const InvoiceEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <InvoiceForm />
        </Edit>
    )
}

const InvoiceCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <InvoiceForm />
        </Create>
    )
}

const InvoiceShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <CoachesReferenceField source="coach_id" />
                <ClientsReferenceField source="client_id" />
                <ClassesReferenceField source="class_id" />
                <DateField source="invoice_date" />
                <TextField source="date" />
                <TextField source="amount" />
                <TextField source="status" />
            </SimpleShowLayout>
        </Show>
    )
}

const invoicesFieldSchema: FieldSchema = {
    coach_id: { resource: 'coaches' },
    client_id: { resource: 'clients' },
    class_id: { resource: 'classes' },
    invoice_date: {},
    date: {},
    amount: {},
    status: {}
};
const invoicesSearchableFields: string[] = [
    'date',
    'amount',
    'status'
];

export const InvoicesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('coaches', record.coach)}
        fieldSchema={ invoicesFieldSchema}
        actionDefs={ invoicesActionDefs}
        searchableFields={ invoicesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<InvoicesList/>}
        create={<InvoiceCreate/>}
        edit={<InvoiceEdit/>}
        show={<InvoiceShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<InvoicesCardList/>}
        hasColumnChooser
        sort={{ field: 'date', order: 'ASC' }}
    />
)
export const InvoicesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Invoices" leftIcon={<ICON />} />
)
