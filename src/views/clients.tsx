import {
    Resource, type ResourceActionDefs, type FieldSchema, createReferenceField, createReferenceInput,
    ReferenceLiveFilter, NumberLiveFilter, TextLiveFilter, editDefaults
} from '@mahaswami/vc-frontend';
import { Business } from '@mui/icons-material';
import {Edit, Menu } from "react-admin";
import ClientCreate from "./clients/ClientCreate.tsx";
import {ClientList} from "./clients/clientList.tsx";
import ClientEditForm from "./clients/ClientEdit.tsx";

export const RESOURCE = "clients"
export const ICON = Business
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

const ClientEdit = (props: any) => (
    <Edit { ...editDefaults(props) } actions={false}>
        <ClientEditForm />
    </Edit>
)

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
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const ClientsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Clients" leftIcon={<ICON />} />
)
