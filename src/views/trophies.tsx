import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Star } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput} from "react-admin";
import { TrophyTypesReferenceField, TrophyTypesReferenceInput } from './trophy_types.js';
import { CoachesReferenceField, CoachesReferenceInput } from './coaches.js';
import { StudentsReferenceField, StudentsReferenceInput } from './students.js';
import { ClientsReferenceField, ClientsReferenceInput } from './clients.js';
import {TrophiesEdit, TrophyList, TrophyShow} from "./certificates/trophies.tsx";

export const RESOURCE = "trophies"
export const ICON = Star
export const PREFETCH: string[] = ["trophy_types", "coaches", "students", "clients"]

export const TrophiesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const TrophiesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const trophiesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="trophy_type_id" reference="trophy_types" label="Trophy Type" />,
    <ReferenceLiveFilter source="coach_id" reference="coaches" label="Coach" />,
    <ReferenceLiveFilter source="student_id" reference="students" label="Student" />,
    <ReferenceLiveFilter source="client_id" reference="clients" label="Client" />,
    <DateLiveFilter source="ordered_date" label="Ordered" />,
    <DateLiveFilter source="received_date" label="Received" />,
    <DateLiveFilter source="issued_date" label="Issued" />
]

const TrophyForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <TrophyTypesReferenceInput source="trophy_type_id" />
            <CoachesReferenceInput source="coach_id" />
            <StudentsReferenceInput source="student_id" />
            <ClientsReferenceInput source="client_id" />
            <TextInput source="status" />
            <DateInput source="ordered_date" />
            <DateInput source="received_date" />
            <DateInput source="issued_date" />
            <TextInput source="image_file_id" />
            <TextInput source="details" />
        </SimpleForm>
    )
}

const TrophyCreate = (props: any) => {
    return (
        <Create {...createDefaults(props)}>
            <TrophyForm />
        </Create>
    )
}

const trophiesFieldSchema: FieldSchema = {
    trophy_type_id: { resource: 'trophy_types' },
    coach_id: { resource: 'coaches' },
    student_id: { resource: 'students' },
    client_id: { resource: 'clients' },
    status: {},
    ordered_date: {},
    received_date: {},
    issued_date: {},
    image_file_id: {},
    details: {}
};
const trophiesSearchableFields: string[] = [
    'status',
    'details'
];

export const TrophiesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('trophy_types', record.trophy_type)}
        fieldSchema={ trophiesFieldSchema}
        actionDefs={ trophiesActionDefs}
        searchableFields={ trophiesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<TrophyList/>}
        create={<TrophyCreate/>}
        edit={<TrophiesEdit/>}
        show={<TrophyShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'status', order: 'ASC' }}
    />
)
export const TrophiesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Trophies" leftIcon={<ICON />} />
)
