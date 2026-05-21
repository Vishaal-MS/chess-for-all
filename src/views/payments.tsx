import {
    Resource, listDefaults,
    type ResourceActionDefs, type FieldSchema, recordRep, createReferenceField,
    createReferenceInput, ReferenceLiveFilter, TextLiveFilter, DataTable, tableDefaults
} from '@mahaswami/vc-frontend';
import { Payments } from '@mui/icons-material';
import { List, Menu, type ListProps} from "react-admin";
import { ClientsReferenceField } from './clients.js';
import {ClassesReferenceField} from "./classes.tsx";
import {formatAmount} from "../utils.ts";

export const RESOURCE = "payments"
export const ICON = Payments
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
                <DataTable.Col source="client_id" field={ClientsReferenceField}/>
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="date" />
                <DataTable.Col render={record => formatAmount(record.amount)} label={"Amount"}/>
            </DataTable>
        </List>
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
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'date', order: 'ASC' }}
    />
)
export const PaymentsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Payments" leftIcon={<ICON />} />
)
