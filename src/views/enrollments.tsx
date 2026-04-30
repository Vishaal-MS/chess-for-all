import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Group } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput} from "react-admin";
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';
import { StudentsReferenceField, StudentsReferenceInput } from './students.js';

export const RESOURCE = "enrollments"
export const ICON = Group
export const PREFETCH: string[] = ["classes", "students"]

export const EnrollmentsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const EnrollmentsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const enrollmentsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <ReferenceLiveFilter source="student_id" reference="students" label="Student" />,
    <DateLiveFilter source="enrollment_date" label="Enrollment" />,
    <DateLiveFilter source="completion_date" label="Completion" />,
    <BooleanLiveFilter source="is_certificate_due" label="Certificate Due" />
]

export const EnrollmentsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['status', 'is_certificate_due']} >
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="student_id" field={StudentsReferenceField}/>
                <DataTable.Col source="enrollment_date" field={DateField}/>
                <DataTable.Col source="completion_date" field={DateField}/>
                <DataTable.Col source="grade" />
                <DataTable.Col source="status" />
                <DataTable.Col source="is_certificate_due" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const EnrollmentsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<ClassesReferenceField source="class_id" variant='h6' link={false} />}>
                <StudentsReferenceField source="student_id" />
                <DateField source="enrollment_date" />
            </CardGrid>
        </List>
    )
}

const EnrollmentForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <ClassesReferenceInput source="class_id" />
            <StudentsReferenceInput source="student_id" />
            <DateInput source="enrollment_date" />
            <DateInput source="completion_date" />
            <TextInput source="grade" />
            <TextInput source="status" />
            <BooleanInput source="is_certificate_due" />
        </SimpleForm>
    )
}

const EnrollmentEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <EnrollmentForm />
        </Edit>
    )
}

const EnrollmentCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <EnrollmentForm />
        </Create>
    )
}

const EnrollmentShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <ClassesReferenceField source="class_id" />
                <StudentsReferenceField source="student_id" />
                <DateField source="enrollment_date" />
                <DateField source="completion_date" />
                <TextField source="grade" />
                <TextField source="status" />
                <BooleanField source="is_certificate_due" />
            </SimpleShowLayout>
        </Show>
    )
}

const enrollmentsFieldSchema: FieldSchema = {
    class_id: { resource: 'classes' },
    student_id: { resource: 'students' },
    enrollment_date: {},
    completion_date: {},
    grade: {},
    status: {},
    is_certificate_due: {}
};
const enrollmentsSearchableFields: string[] = [
    'grade',
    'status'
];

export const EnrollmentsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('classes', record.class)}
        fieldSchema={ enrollmentsFieldSchema}
        actionDefs={ enrollmentsActionDefs}
        searchableFields={ enrollmentsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<EnrollmentsList/>}
        create={<EnrollmentCreate/>}
        edit={<EnrollmentEdit/>}
        show={<EnrollmentShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<EnrollmentsCardList/>}
        hasColumnChooser
        sort={{ field: 'grade', order: 'ASC' }}
    />
)
export const EnrollmentsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Enrollments" leftIcon={<ICON />} />
)
