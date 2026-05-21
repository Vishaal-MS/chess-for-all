import { Resource, tableDefaults, listDefaults, RowActions, DataTable,
    type ResourceActionDefs, type FieldSchema, recordRep, createReferenceField, createReferenceInput,
    ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Receipt } from '@mui/icons-material';
import { List, type ListProps, DateField, Toolbar, Button } from "react-admin";
import { ClientsReferenceField } from './clients.js';
import { ClassesReferenceField } from './classes.js';
import {formatAmount} from "../utils.ts";

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

const InvoiceListActions = () => (
    <Toolbar>
        <Button variant="contained" sx={{marginRight:1}} label="Generate Invoices" onClick={() => {alert('This is coming soon. We\'re working on it!')}} />
    </Toolbar>
);

export const InvoicesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} actions={<InvoiceListActions/>}>
            <DataTable {...tableDefaults(RESOURCE)} sort={{field:'date',order:'ASC'}} hiddenColumns={['amount', 'status']}>
                <DataTable.Col source="client_id" field={ClientsReferenceField}/>
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="invoice_date" field={DateField}/>
                <DataTable.Col label={"Amount"} render={record => formatAmount(record.amount)}/>
                <DataTable.Col source="date" />
                <DataTable.Col source="status" sx={{ textTransform: 'capitalize' }} />
                <RowActions/>
            </DataTable>
        </List>
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
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'date', order: 'ASC' }}
    />
)