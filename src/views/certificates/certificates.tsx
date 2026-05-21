import {
    TextInput, FileInput, FileField, Toolbar, Button,
    ImageInput, ImageField, SimpleShowLayout, TextField, Edit, Show, List, DateField
} from 'react-admin';
import {isExecutiveCoachingFlavored, isProCoach} from "../../businessLogic";
import {DataTable, PER_PAGE, SensibleDefaultPagination, SimpleForm} from "@mahaswami/vc-frontend";
import {CertificateTemplatesReferenceField, CertificateTemplatesReferenceInput} from "../certificate_templates.tsx";
import {CoachesReferenceField} from "../coaches.tsx";
import {StudentsReferenceField} from "../students.tsx";
import {CurriculumsReferenceField} from "../curriculums.tsx";
import {ClientsReferenceField} from "../clients.tsx";

const CertificateListActions = () => (
    <Toolbar>
        <Button variant="contained" sx={{marginRight:1}} label="New Certificate" onClick={() => {alert('This is coming soon. We\'re working on it!')}} />
        <Button variant="contained" label="Order Certificates" onClick={() => {alert('Ordering certificates is coming soon. We\'re working on it!')}} />
    </Toolbar>
);

export const CertificateEdit = () => {

    return(
        <Edit>
            <SimpleForm>
                <TextInput source="id" />
                <CertificateTemplatesReferenceInput source="certificate_template_id" label="Certificate Template" />
                <CoachesReferenceField source="coach_id" label="Coach" />
                <StudentsReferenceField source="student_id" label={isExecutiveCoachingFlavored() ? "Executive" : "Student"} />
                <CurriculumsReferenceField source="curriculum_id" label="Curriculum" />
                <ClientsReferenceField source="client_id" label="Client" />
                <TextInput source="status" />
                <TextInput source="issued_date" label="Issued Date" />
                <FileInput source="attachment_file_id" label="Certificate">
                    <FileField source="src" title="title" />
                </FileInput>
                <ImageInput source="image_file_id" label="Certificate Image">
                    <ImageField source="src" title="title" />
                </ImageInput>
            </SimpleForm>
        </Edit>
    );
}

export const CertificateShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <ImageField source="image_file_id" src="src" title="title" label=""
                            sx={{ '& .RaImageField-image': { width:'100%',height:600,objectFit: 'contain',alignItems:'center' },
                                    '& .RaImageField-list':{justifyContent: 'center'}}}/>
            </SimpleShowLayout>
        </Show>
    );
}

export const CertificateList = () => (
    <List actions={<CertificateListActions/>} pagination={<SensibleDefaultPagination />} perPage={PER_PAGE}>
        <DataTable>
            <DataTable.Col source="certificate_template_id" label="Type" field={CertificateTemplatesReferenceField} />
            {!isProCoach() && <DataTable.Col field={() =>
                <CoachesReferenceField source="coach_id" link={false}>
                        <TextField source="user.fullName" label="Name"/>
                </CoachesReferenceField>}
            />}
            <DataTable.Col source="student_id" field={() =>
                <StudentsReferenceField source="student_id" link={false}>
                    <TextField source="user.fullName" label="Name"/>
                </StudentsReferenceField>
            } />
            <DataTable.Col source="curriculum_id" label="Curriculum" field={CurriculumsReferenceField}/>
            <DataTable.Col source="client_id" label="Client" field={ClientsReferenceField}/>
            <DataTable.Col source="ordered_date" label="Ordered Date" field={DateField}/>
            <DataTable.Col source="received_date" label="Received Date" field={DateField}/>
            <DataTable.Col source="issued_date" label="Issued Date" field={DateField}/>
            <DataTable.Col source="status" sx={{textTransform: 'capitalize'}} />
            <DataTable.Col source='attachment_file_id' field={() =>
                <FileField source="attachment_file_id" src="src" title="title" label="Certificate"/>} />
        </DataTable>
    </List>
);