import { Resource, createDefaults, formDefaults, showDefaults, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, recordRep, createReferenceField,
    createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { School } from '@mui/icons-material';
import { Create, Menu, Show, TextField, TextInput, DateField, DateInput} from "react-admin";
import { CertificateTemplatesReferenceField, CertificateTemplatesReferenceInput } from './certificate_templates.js';
import { CoachesReferenceField, CoachesReferenceInput } from './coaches.js';
import { StudentsReferenceField, StudentsReferenceInput } from './students.js';
import { ClientsReferenceField, ClientsReferenceInput } from './clients.js';
import {CurriculumsReferenceField, CurriculumsReferenceInput} from "./curriculums.tsx";
import {CertificateEdit, CertificateList, CertificateShow} from './certificates/certificates.tsx';

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

const CertificateCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <CertificateForm />
        </Create>
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
        list={<CertificateList/>}
        create={<CertificateCreate/>}
        edit={<CertificateEdit/>}
        show={<CertificateShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'status', order: 'ASC' }}
    />
)
export const CertificatesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Certificates" leftIcon={<ICON />} />
)
