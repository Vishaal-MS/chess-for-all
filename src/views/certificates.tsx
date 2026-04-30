import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { School } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput} from "react-admin";
import { CertificateTemplatesReferenceField, CertificateTemplatesReferenceInput } from './certificate_templates.js';
import { CoachesReferenceField, CoachesReferenceInput } from './coaches.js';
import { StudentsReferenceField, StudentsReferenceInput } from './students.js';
import { ClientsReferenceField, ClientsReferenceInput } from './clients.js';
import {CurriculumsReferenceField, CurriculumsReferenceInput} from "./curriculums.tsx";

export const RESOURCE = "certificates"
export const ICON = School
export const PREFETCH: string[] = ["certificate_templates", "coaches", "students", "curricula", "clients"]

export const CertificatesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const CertificatesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const certificatesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="certificate_template_id" reference="certificate_templates" label="Certificate Template" />,
    <ReferenceLiveFilter source="coach_id" reference="coaches" label="Coach" />,
    <ReferenceLiveFilter source="student_id" reference="students" label="Student" />,
    <ReferenceLiveFilter source="curriculum_id" reference="curricula" label="Curriculum" />,
    <ReferenceLiveFilter source="client_id" reference="clients" label="Client" />,
    <DateLiveFilter source="ordered_date" label="Ordered" />,
    <DateLiveFilter source="received_date" label="Received" />,
    <DateLiveFilter source="issued_date" label="Issued" />
]

export const CertificatesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['status', 'ordered_date', 'received_date', 'issued_date', 'attachment_file_id', 'image_file_id']} >
                <DataTable.Col source="certificate_template_id" field={CertificateTemplatesReferenceField}/>
                <DataTable.Col source="coach_id" field={CoachesReferenceField}/>
                <DataTable.Col source="student_id" field={StudentsReferenceField}/>
                <DataTable.Col source="curriculum_id" field={CurriculumsReferenceField}/>
                <DataTable.Col source="client_id" field={ClientsReferenceField}/>
                <DataTable.Col source="status" />
                <DataTable.Col source="ordered_date" field={DateField}/>
                <DataTable.Col source="received_date" field={DateField}/>
                <DataTable.Col source="issued_date" field={DateField}/>
                <DataTable.Col source="attachment_file_id" />
                <DataTable.Col source="image_file_id" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const CertificatesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<CertificateTemplatesReferenceField source="certificate_template_id" variant='h6' link={false} />}>
                <CoachesReferenceField source="coach_id" />
                <StudentsReferenceField source="student_id" />
            </CardGrid>
        </List>
    )
}

const CertificateForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <CertificateTemplatesReferenceInput source="certificate_template_id" />
            <CoachesReferenceInput source="coach_id" />
            <StudentsReferenceInput source="student_id" />
            <CurriculumsReferenceInput source="curriculum_id" />
            <ClientsReferenceInput source="client_id" />
            <TextInput source="status" />
            <DateInput source="ordered_date" />
            <DateInput source="received_date" />
            <DateInput source="issued_date" />
            <TextInput source="attachment_file_id" />
            <TextInput source="image_file_id" />
        </SimpleForm>
    )
}

const CertificateEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <CertificateForm />
        </Edit>
    )
}

const CertificateCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <CertificateForm />
        </Create>
    )
}

const CertificateShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <CertificateTemplatesReferenceField source="certificate_template_id" />
                <CoachesReferenceField source="coach_id" />
                <StudentsReferenceField source="student_id" />
                <CurriculumsReferenceField source="curriculum_id" />
                <ClientsReferenceField source="client_id" />
                <TextField source="status" />
                <DateField source="ordered_date" />
                <DateField source="received_date" />
                <DateField source="issued_date" />
                <TextField source="attachment_file_id" />
                <TextField source="image_file_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const certificatesFieldSchema: FieldSchema = {
    certificate_template_id: { resource: 'certificate_templates' },
    coach_id: { resource: 'coaches' },
    student_id: { resource: 'students' },
    curriculum_id: { resource: 'curricula' },
    client_id: { resource: 'clients' },
    status: {},
    ordered_date: {},
    received_date: {},
    issued_date: {},
    attachment_file_id: {},
    image_file_id: {}
};
const certificatesSearchableFields: string[] = [
    'status'
];

export const CertificatesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('certificate_templates', record.certificate_template)}
        fieldSchema={ certificatesFieldSchema}
        actionDefs={ certificatesActionDefs}
        searchableFields={ certificatesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<CertificatesList/>}
        create={<CertificateCreate/>}
        edit={<CertificateEdit/>}
        show={<CertificateShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<CertificatesCardList/>}
        hasColumnChooser
        sort={{ field: 'status', order: 'ASC' }}
    />
)
export const CertificatesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Certificates" leftIcon={<ICON />} />
)
