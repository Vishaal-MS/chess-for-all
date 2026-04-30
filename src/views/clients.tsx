import { Resource,
	editDefaults, formDefaults,
	showDefaults, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, createReferenceField, createReferenceInput,
    ReferenceLiveFilter, NumberLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { People } from '@mui/icons-material';
import {Edit, Menu, Show, TextField, TextInput, NumberField, NumberInput, required, Button} from "react-admin";
import { ClientTypesReferenceField, ClientTypesReferenceInput } from './client_types.js';
import { DivisionsReferenceField, DivisionsReferenceInput } from './divisions.js';
import { StandardsReferenceField, StandardsReferenceInput } from './standards.js';
import ClientCreate from "./clients/ClientCreate.tsx";
import {ClientList} from "./clients/clientList.tsx";
import ClientEdit from "./clients/ClientEdit.tsx";

export const RESOURCE = "clients"
export const ICON = People
export const PREFETCH: string[] = ["client_types", "divisions", "standards"]

export const ClientsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ClientsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const clientsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <NumberLiveFilter source="primary_contact_number" label="Primary Contact" />,
    <ReferenceLiveFilter source="client_type_id" reference="client_types" label="Client Type" />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />,
    <ReferenceLiveFilter source="standard_id" reference="standards" label="Standard" />
]

const ClientForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <TextInput source="name" validate={required()} />
            <TextInput source="primary_contact_name" />
            <NumberInput source="primary_contact_number" />
            <TextInput source="email" validate={required()} />
            <TextInput source="address_line" />
            <TextInput source="area" />
            <TextInput source="city" />
            <TextInput source="state" />
            <TextInput source="zipcode" />
            <TextInput source="country" />
            <TextInput source="image_file_id" />
            <ClientTypesReferenceInput source="client_type_id" />
            <DivisionsReferenceInput source="division_id" />
            <StandardsReferenceInput source="standard_id" />
        </SimpleForm>
    )
}

const ClientShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <TextField source="name" />
                <TextField source="primary_contact_name" />
                <NumberField source="primary_contact_number" />
                <TextField source="email" />
                <TextField source="address_line" />
                <TextField source="area" />
                <TextField source="city" />
                <TextField source="state" />
                <TextField source="zipcode" />
                <TextField source="country" />
                <TextField source="image_file_id" />
                <ClientTypesReferenceField source="client_type_id" />
                <DivisionsReferenceField source="division_id" />
                <StandardsReferenceField source="standard_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const clientsFieldSchema: FieldSchema = {
    name: { required: true },
    primary_contact_name: {},
    primary_contact_number: {},
    email: { required: true },
    address_line: {},
    area: {},
    city: {},
    state: {},
    zipcode: {},
    country: {},
    image_file_id: {},
    client_type_id: { resource: 'client_types' },
    division_id: { resource: 'divisions' },
    standard_id: { resource: 'standards' }
};
const clientsSearchableFields: string[] = [
    'name',
    'primary_contact_name',
    'email',
    'address_line',
    'area',
    'city',
    'state',
    'zipcode',
    'country'
];

export const ClientsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ clientsFieldSchema}
        actionDefs={ clientsActionDefs}
        searchableFields={ clientsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ClientList />}
        create={<ClientCreate />}
        edit={<ClientEdit/>}
        show={<ClientShow/>}
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const ClientsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Clients" leftIcon={<ICON />} />
)
