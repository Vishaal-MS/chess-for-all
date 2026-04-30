import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, NumberLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { AssignmentTurnedIn } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput, NumberField, NumberInput} from "react-admin";
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';
import { LessonsReferenceField, LessonsReferenceInput } from './lessons.js';
import { BackgroundMusicsReferenceField, BackgroundMusicsReferenceInput } from './background_musics.js';

export const RESOURCE = "class_progresses"
export const ICON = AssignmentTurnedIn
export const PREFETCH: string[] = ["classes", "lessons", "mapping1_standard_sections", "mapping2_standard_sections", "mapping3_standard_sections", "mapping1_cognitive_skills", "mapping2_cognitive_skills", "mapping3_cognitive_skills", "background_musics"]

export const ClassProgressesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ClassProgressesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const classProgressesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <ReferenceLiveFilter source="lesson_id" reference="lessons" label="Lesson" />,
    <DateLiveFilter source="start_date" label="Start" />,
    <DateLiveFilter source="completion_date" label="Completion" />,
    <BooleanLiveFilter source="is_assigned" label="Assigned" />,
    <NumberLiveFilter source="position_number" label="Position" />,
    <ReferenceLiveFilter source="mapping1_standard_section_id" reference="mapping1_standard_sections" label="Mapping1 Standard Section" />,
    <ReferenceLiveFilter source="mapping2_standard_section_id" reference="mapping2_standard_sections" label="Mapping2 Standard Section" />,
    <ReferenceLiveFilter source="mapping3_standard_section_id" reference="mapping3_standard_sections" label="Mapping3 Standard Section" />,
    <ReferenceLiveFilter source="mapping1_cognitive_skill_id" reference="mapping1_cognitive_skills" label="Mapping1 Cognitive Skill" />,
    <ReferenceLiveFilter source="mapping2_cognitive_skill_id" reference="mapping2_cognitive_skills" label="Mapping2 Cognitive Skill" />,
    <ReferenceLiveFilter source="mapping3_cognitive_skill_id" reference="mapping3_cognitive_skills" label="Mapping3 Cognitive Skill" />,
    <BooleanLiveFilter source="is_limit_to_show_single_section" label="Limit To Show Single Section" />,
    <BooleanLiveFilter source="is_game_sound_enabled" label="Game Sound Enabled" />,
    <ReferenceLiveFilter source="background_music_id" reference="background_musics" label="Background Music" />,
    <BooleanLiveFilter source="is_voice_over_enabled" label="Voice Over Enabled" />
]

export const ClassProgressesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['is_assigned', 'position_number', 'mapping1_standard_section_id', 'mapping2_standard_section_id', 'mapping3_standard_section_id', 'mapping1_cognitive_skill_id', 'mapping2_cognitive_skill_id', 'mapping3_cognitive_skill_id', 'is_limit_to_show_single_section', 'is_game_sound_enabled', 'background_music_id', 'is_voice_over_enabled']} >
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="lesson_id" field={LessonsReferenceField}/>
                <DataTable.Col source="status" />
                <DataTable.Col source="start_date" field={DateField}/>
                <DataTable.Col source="completion_date" field={DateField}/>
                <DataTable.Col source="is_assigned" field={BooleanField}/>
                <DataTable.Col source="position_number" field={NumberField}/>
                <DataTable.Col source="mapping1_standard_section_id" />
                <DataTable.Col source="mapping2_standard_section_id" />
                <DataTable.Col source="mapping3_standard_section_id" />
                <DataTable.Col source="mapping1_cognitive_skill_id" />
                <DataTable.Col source="mapping2_cognitive_skill_id" />
                <DataTable.Col source="mapping3_cognitive_skill_id" />
                <DataTable.Col source="is_limit_to_show_single_section" field={BooleanField}/>
                <DataTable.Col source="is_game_sound_enabled" field={BooleanField}/>
                <DataTable.Col source="background_music_id" field={BackgroundMusicsReferenceField}/>
                <DataTable.Col source="is_voice_over_enabled" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const ClassProgressesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<ClassesReferenceField source="class_id" variant='h6' link={false} />}>
                <LessonsReferenceField source="lesson_id" />
                <TextField source="status" />
            </CardGrid>
        </List>
    )
}

const ClassProgressForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <ClassesReferenceInput source="class_id" />
            <LessonsReferenceInput source="lesson_id" />
            <TextInput source="status" />
            <DateInput source="start_date" />
            <DateInput source="completion_date" />
            <BooleanInput source="is_assigned" />
            <NumberInput source="position_number" />
            <TextInput source="mapping1_standard_section_id" />
            <TextInput source="mapping2_standard_section_id" />
            <TextInput source="mapping3_standard_section_id" />
            <TextInput source="mapping1_cognitive_skill_id" />
            <TextInput source="mapping2_cognitive_skill_id" />
            <TextInput source="mapping3_cognitive_skill_id" />
            <BooleanInput source="is_limit_to_show_single_section" />
            <BooleanInput source="is_game_sound_enabled" />
            <BackgroundMusicsReferenceInput source="background_music_id" />
            <BooleanInput source="is_voice_over_enabled" />
        </SimpleForm>
    )
}

const ClassProgressEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <ClassProgressForm />
        </Edit>
    )
}

const ClassProgressCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <ClassProgressForm />
        </Create>
    )
}

const ClassProgressShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <ClassesReferenceField source="class_id" />
                <LessonsReferenceField source="lesson_id" />
                <TextField source="status" />
                <DateField source="start_date" />
                <DateField source="completion_date" />
                <BooleanField source="is_assigned" />
                <NumberField source="position_number" />
                <TextInput source="mapping1_standard_section_id" />
                <TextInput source="mapping2_standard_section_id" />
                <TextInput source="mapping3_standard_section_id" />
                <TextInput source="mapping1_cognitive_skill_id" />
                <TextInput source="mapping2_cognitive_skill_id" />
                <TextInput source="mapping3_cognitive_skill_id" />
                <BooleanField source="is_limit_to_show_single_section" />
                <BooleanField source="is_game_sound_enabled" />
                <BackgroundMusicsReferenceField source="background_music_id" />
                <BooleanField source="is_voice_over_enabled" />
            </SimpleShowLayout>
        </Show>
    )
}

const classProgressesFieldSchema: FieldSchema = {
    class_id: { resource: 'classes' },
    lesson_id: { resource: 'lessons' },
    status: {},
    start_date: {},
    completion_date: {},
    is_assigned: {},
    position_number: {},
    mapping1_standard_section_id: { resource: 'mapping1_standard_sections' },
    mapping2_standard_section_id: { resource: 'mapping2_standard_sections' },
    mapping3_standard_section_id: { resource: 'mapping3_standard_sections' },
    mapping1_cognitive_skill_id: { resource: 'mapping1_cognitive_skills' },
    mapping2_cognitive_skill_id: { resource: 'mapping2_cognitive_skills' },
    mapping3_cognitive_skill_id: { resource: 'mapping3_cognitive_skills' },
    is_limit_to_show_single_section: {},
    is_game_sound_enabled: {},
    background_music_id: { resource: 'background_musics' },
    is_voice_over_enabled: {}
};
const classProgressesSearchableFields: string[] = [
    'status'
];

export const ClassProgressesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('classes', record.class)}
        fieldSchema={ classProgressesFieldSchema}
        actionDefs={ classProgressesActionDefs}
        searchableFields={ classProgressesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ClassProgressesList/>}
        create={<ClassProgressCreate/>}
        edit={<ClassProgressEdit/>}
        show={<ClassProgressShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<ClassProgressesCardList/>}
        hasColumnChooser
        sort={{ field: 'status', order: 'ASC' }}
    />
)
export const ClassProgressesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Class Progresses" leftIcon={<ICON />} />
)
