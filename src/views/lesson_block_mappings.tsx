import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Assignment } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps } from "react-admin";
import { LessonsReferenceField, LessonsReferenceInput } from './lessons.js';
import { LessonBlocksReferenceField, LessonBlocksReferenceInput } from './lesson_blocks.js';

export const RESOURCE = "lesson_block_mappings"
export const ICON = Assignment
export const PREFETCH: string[] = ["lessons", "lesson_blocks"]

export const LessonBlockMappingsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const LessonBlockMappingsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const lessonBlockMappingsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="lesson_id" reference="lessons" label="Lesson" />,
    <ReferenceLiveFilter source="lesson_block_id" reference="lesson_blocks" label="Lesson Block" />
]

export const LessonBlockMappingsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="lesson_id" field={LessonsReferenceField}/>
                <DataTable.Col source="lesson_block_id" field={LessonBlocksReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const LessonBlockMappingsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<LessonsReferenceField source="lesson_id" variant='h6' link={false} />}>
                <LessonBlocksReferenceField source="lesson_block_id" />
            </CardGrid>
        </List>
    )
}

const LessonBlockMappingForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <LessonsReferenceInput source="lesson_id" />
            <LessonBlocksReferenceInput source="lesson_block_id" />
        </SimpleForm>
    )
}

const LessonBlockMappingEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <LessonBlockMappingForm />
        </Edit>
    )
}

const LessonBlockMappingCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <LessonBlockMappingForm />
        </Create>
    )
}

const LessonBlockMappingShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <LessonsReferenceField source="lesson_id" />
                <LessonBlocksReferenceField source="lesson_block_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const lessonBlockMappingsFieldSchema: FieldSchema = {
    lesson_id: { resource: 'lessons' },
    lesson_block_id: { resource: 'lesson_blocks' }
};
const lessonBlockMappingsSearchableFields: string[] = [
    'lesson.name'
];

export const LessonBlockMappingsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('lessons', record.lesson)}
        fieldSchema={ lessonBlockMappingsFieldSchema}
        actionDefs={ lessonBlockMappingsActionDefs}
        searchableFields={ lessonBlockMappingsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<LessonBlockMappingsList/>}
        create={<LessonBlockMappingCreate/>}
        edit={<LessonBlockMappingEdit/>}
        show={<LessonBlockMappingShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<LessonBlockMappingsCardList/>}
        sort={{ field: 'lesson.name', order: 'ASC' }}
    />
)
export const LessonBlockMappingsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Lesson Block Mappings" leftIcon={<ICON />} />
)
