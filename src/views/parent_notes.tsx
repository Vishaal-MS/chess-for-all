import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Note } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput} from "react-admin";
import { CoachesReferenceField, CoachesReferenceInput } from './coaches.js';
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';
import { StudentsReferenceField, StudentsReferenceInput } from './students.js';
import {UsersReferenceField, UsersReferenceInput} from "./users.tsx";

export const RESOURCE = "parent_notes"
export const ICON = Note
export const PREFETCH: string[] = ["parent_users", "coaches", "classes", "students"]

export const ParentNotesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ParentNotesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const parentNotesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <DateLiveFilter source="created_date" label="Created" />,
    <ReferenceLiveFilter source="parent_user_id" reference="parent_users" label="Parent User" />,
    <ReferenceLiveFilter source="coach_id" reference="coaches" label="Coach" />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <ReferenceLiveFilter source="student_id" reference="students" label="Student" />
]

export const ParentNotesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['student_id']} >
                <DataTable.Col source="note" />
                <DataTable.Col source="created_date" field={DateField}/>
                <DataTable.Col source="parent_user_id" field={UsersReferenceField}/>
                <DataTable.Col source="coach_id" field={CoachesReferenceField}/>
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="student_id" field={StudentsReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const ParentNotesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="note" variant='h6' />}>
                <DateField source="created_date" />
                <UsersReferenceField source="parent_user_id" />
            </CardGrid>
        </List>
    )
}

const ParentNoteForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <TextInput source="note" />
            <DateInput source="created_date" />
            <UsersReferenceInput source="parent_user_id" />
            <CoachesReferenceInput source="coach_id" />
            <ClassesReferenceInput source="class_id" />
            <StudentsReferenceInput source="student_id" />
        </SimpleForm>
    )
}

const ParentNoteEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <ParentNoteForm />
        </Edit>
    )
}

const ParentNoteCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <ParentNoteForm />
        </Create>
    )
}

const ParentNoteShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <TextField source="note" />
                <DateField source="created_date" />
                <UsersReferenceField source="parent_user_id" />
                <CoachesReferenceField source="coach_id" />
                <ClassesReferenceField source="class_id" />
                <StudentsReferenceField source="student_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const parentNotesFieldSchema: FieldSchema = {
    note: {},
    created_date: {},
    parent_user_id: { resource: 'parent_users' },
    coach_id: { resource: 'coaches' },
    class_id: { resource: 'classes' },
    student_id: { resource: 'students' }
};
const parentNotesSearchableFields: string[] = [
    'note'
];

export const ParentNotesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => record.note}
        fieldSchema={ parentNotesFieldSchema}
        actionDefs={ parentNotesActionDefs}
        searchableFields={ parentNotesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ParentNotesList/>}
        create={<ParentNoteCreate/>}
        edit={<ParentNoteEdit/>}
        show={<ParentNoteShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<ParentNotesCardList/>}
        hasColumnChooser
        sort={{ field: 'note', order: 'ASC' }}
    />
)
export const ParentNotesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Parent Notes" leftIcon={<ICON />} />
)
