import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { PlaylistAddCheck } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput} from "react-admin";
import { AssignmentsReferenceField, AssignmentsReferenceInput } from './assignments.js';
import { LessonBlocksReferenceField, LessonBlocksReferenceInput } from './lesson_blocks.js';

export const RESOURCE = "assignment_blocks"
export const ICON = PlaylistAddCheck
export const PREFETCH: string[] = ["assignments", "lesson_blocks"]

export const AssignmentBlocksReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const AssignmentBlocksReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const assignmentBlocksActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="assignment_id" reference="assignments" label="Assignment" />,
    <ReferenceLiveFilter source="lesson_block_id" reference="lesson_blocks" label="Lesson Block" />,
    <DateLiveFilter source="last_accessed_date" label="Last Accessed" />,
    <DateLiveFilter source="started_date" label="Started" />,
    <DateLiveFilter source="completed_date" label="Completed" />
]

export const AssignmentBlocksList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['completed_date', 'fen_position', 'mcq', 'description', 'retry_count']} >
                <DataTable.Col source="assignment_id" field={AssignmentsReferenceField}/>
                <DataTable.Col source="lesson_block_id" field={LessonBlocksReferenceField}/>
                <DataTable.Col source="status" />
                <DataTable.Col source="last_accessed_date" field={DateField}/>
                <DataTable.Col source="started_date" field={DateField}/>
                <DataTable.Col source="completed_date" field={DateField}/>
                <DataTable.Col source="fen_position" />
                <DataTable.Col source="mcq" />
                <DataTable.Col source="description" />
                <DataTable.Col source="retry_count" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const AssignmentBlocksCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<AssignmentsReferenceField source="assignment_id" variant='h6' link={false} />}>
                <LessonBlocksReferenceField source="lesson_block_id" />
                <TextField source="status" />
            </CardGrid>
        </List>
    )
}

const AssignmentBlockForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <AssignmentsReferenceInput source="assignment_id" />
            <LessonBlocksReferenceInput source="lesson_block_id" />
            <TextInput source="status" />
            <DateInput source="last_accessed_date" />
            <DateInput source="started_date" />
            <DateInput source="completed_date" />
            <TextInput source="fen_position" />
            <TextInput source="mcq" />
            <TextInput source="description" />
            <TextInput source="retry_count" />
        </SimpleForm>
    )
}

const AssignmentBlockEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <AssignmentBlockForm />
        </Edit>
    )
}

const AssignmentBlockCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <AssignmentBlockForm />
        </Create>
    )
}

const AssignmentBlockShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <AssignmentsReferenceField source="assignment_id" />
                <LessonBlocksReferenceField source="lesson_block_id" />
                <TextField source="status" />
                <DateField source="last_accessed_date" />
                <DateField source="started_date" />
                <DateField source="completed_date" />
                <TextField source="fen_position" />
                <TextField source="mcq" />
                <TextField source="description" />
                <TextField source="retry_count" />
            </SimpleShowLayout>
        </Show>
    )
}

const assignmentBlocksFieldSchema: FieldSchema = {
    assignment_id: { resource: 'assignments' },
    lesson_block_id: { resource: 'lesson_blocks' },
    status: {},
    last_accessed_date: {},
    started_date: {},
    completed_date: {},
    fen_position: {},
    mcq: {},
    description: {},
    retry_count: {}
};
const assignmentBlocksSearchableFields: string[] = [
    'status',
    'fen_position',
    'mcq',
    'description',
    'retry_count'
];

export const AssignmentBlocksResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('assignments', record.assignment)}
        fieldSchema={ assignmentBlocksFieldSchema}
        actionDefs={ assignmentBlocksActionDefs}
        searchableFields={ assignmentBlocksSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<AssignmentBlocksList/>}
        create={<AssignmentBlockCreate/>}
        edit={<AssignmentBlockEdit/>}
        show={<AssignmentBlockShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<AssignmentBlocksCardList/>}
        hasColumnChooser
        sort={{ field: 'status', order: 'ASC' }}
    />
)
export const AssignmentBlocksMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Assignment Blocks" leftIcon={<ICON />} />
)
