import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Assignment } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, DateTimeInput, BooleanField, BooleanInput} from "react-admin";
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';
import { LessonsReferenceField, LessonsReferenceInput } from './lessons.js';
import { StudentsReferenceField, StudentsReferenceInput } from './students.js';

export const RESOURCE = "assignments"
export const ICON = Assignment
export const PREFETCH: string[] = ["classes", "lessons", "students"]

export const AssignmentsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const AssignmentsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const assignmentsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <ReferenceLiveFilter source="lesson_id" reference="lessons" label="Lesson" />,
    <ReferenceLiveFilter source="student_id" reference="students" label="Student" />,
    <DateLiveFilter source="assigned_timestamp" label="Assigned Timestamp" />,
    <DateLiveFilter source="completed_date" label="Completed" />,
    <DateLiveFilter source="last_accessed_date" label="Last Accessed" />,
    <BooleanLiveFilter source="is_assessment" label="Assessment" />
]

export const AssignmentsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['total_blocks', 'unique_direct_assignment_identifier', 'assigned_timestamp', 'completed_date', 'last_accessed_date', 'time_spent', 'is_assessment']} >
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="lesson_id" field={LessonsReferenceField}/>
                <DataTable.Col source="student_id" field={StudentsReferenceField}/>
                <DataTable.Col source="status" />
                <DataTable.Col source="completed_blocks" />
                <DataTable.Col source="total_blocks" />
                <DataTable.Col source="unique_direct_assignment_identifier" />
                <DataTable.Col source="assigned_timestamp" field={(props: any) => <DateField {...props} showTime />}/>
                <DataTable.Col source="completed_date" field={DateField}/>
                <DataTable.Col source="last_accessed_date" field={DateField}/>
                <DataTable.Col source="time_spent" />
                <DataTable.Col source="is_assessment" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const AssignmentsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<ClassesReferenceField source="class_id" variant='h6' link={false} />}>
                <LessonsReferenceField source="lesson_id" />
                <StudentsReferenceField source="student_id" />
            </CardGrid>
        </List>
    )
}

const AssignmentForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <ClassesReferenceInput source="class_id" />
            <LessonsReferenceInput source="lesson_id" />
            <StudentsReferenceInput source="student_id" />
            <TextInput source="status" />
            <TextInput source="completed_blocks" />
            <TextInput source="total_blocks" />
            <TextInput source="unique_direct_assignment_identifier" />
            <DateTimeInput source="assigned_timestamp" />
            <DateInput source="completed_date" />
            <DateInput source="last_accessed_date" />
            <TextInput source="time_spent" />
            <BooleanInput source="is_assessment" />
        </SimpleForm>
    )
}

const AssignmentEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <AssignmentForm />
        </Edit>
    )
}

const AssignmentCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <AssignmentForm />
        </Create>
    )
}

const AssignmentShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <ClassesReferenceField source="class_id" />
                <LessonsReferenceField source="lesson_id" />
                <StudentsReferenceField source="student_id" />
                <TextField source="status" />
                <TextField source="completed_blocks" />
                <TextField source="total_blocks" />
                <TextField source="unique_direct_assignment_identifier" />
                <DateField source="assigned_timestamp" showTime />
                <DateField source="completed_date" />
                <DateField source="last_accessed_date" />
                <TextField source="time_spent" />
                <BooleanField source="is_assessment" />
            </SimpleShowLayout>
        </Show>
    )
}

const assignmentsFieldSchema: FieldSchema = {
    class_id: { resource: 'classes' },
    lesson_id: { resource: 'lessons' },
    student_id: { resource: 'students' },
    status: {},
    completed_blocks: {},
    total_blocks: {},
    unique_direct_assignment_identifier: {},
    assigned_timestamp: {},
    completed_date: {},
    last_accessed_date: {},
    time_spent: {},
    is_assessment: {}
};
const assignmentsSearchableFields: string[] = [
    'status',
    'completed_blocks',
    'total_blocks',
    'unique_direct_assignment_identifier',
    'time_spent'
];

export const AssignmentsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('classes', record.class)}
        fieldSchema={ assignmentsFieldSchema}
        actionDefs={ assignmentsActionDefs}
        searchableFields={ assignmentsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<AssignmentsList/>}
        create={<AssignmentCreate/>}
        edit={<AssignmentEdit/>}
        show={<AssignmentShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<AssignmentsCardList/>}
        hasColumnChooser
        sort={{ field: 'status', order: 'ASC' }}
    />
)
export const AssignmentsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Assignments" leftIcon={<ICON />} />
)
