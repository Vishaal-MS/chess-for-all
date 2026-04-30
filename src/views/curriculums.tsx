import {
    Resource,
    createDefaults,
    tableDefaults,
    editDefaults,
    formDefaults,
    listDefaults,
    showDefaults,
    RowActions,
    DataTable,
    SimpleShowLayout,
    SimpleForm,
    TabbedDetailLayout,
    createReferenceField,
    createReferenceInput,
    recordRep,
    type ResourceActionDefs,
    type FieldSchema,
    CardGrid,
    BooleanLiveFilter,
    ReferenceLiveFilter,
    ChoicesLiveFilter,
    NumberLiveFilter,
    TextLiveFilter,
    RichTextInput
} from '@mahaswami/vc-frontend';
import { MenuBook, Category} from '@mui/icons-material';
import {
    Create,
    Edit,
    List,
    Menu,
    Show,
    type ListProps,
    TextField,
    TextInput,
    BooleanField,
    BooleanInput,
    NumberField,
    NumberInput,
    SelectField,
    SelectInput,
    AutocompleteInput,
    required,
    useRecordContext
} from "react-admin";
import { LevelsReferenceField, LevelsReferenceInput } from './levels.js';
import { DivisionsReferenceField, DivisionsReferenceInput } from './divisions.js';
import { StandardsReferenceField, StandardsReferenceInput } from './standards.js';
import { BackgroundMusicsReferenceField, BackgroundMusicsReferenceInput } from './background_musics.js';
import { LessonsReferenceField, LessonsReferenceInput } from './lessons.js';
import { Box } from '@mui/material';
import {Fragment} from "react";

export const RESOURCE = "curriculums"
export const DETAIL_RESOURCES: string[] = ["curriculum_lessons"]
export const ICON = MenuBook
export const DETAIL_ICONS: any[] = [Category]
export const PREFETCH: string[] = ["levels", "divisions", "standards", "background_musics"]
export const DETAIL_PREFETCH: string[][] = [[RESOURCE, "lessons", "mapping1_standard_sections", "mapping2_standard_sections", "mapping3_standard_sections", "mapping1_cognitive_skills", "mapping2_cognitive_skills", "mapping3_cognitive_skills"]]

export const CurriculumsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const CurriculumsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
export const CurriculumLessonsReferenceField = createReferenceField(DETAIL_RESOURCES[0], DETAIL_PREFETCH[0]);
export const CurriculumLessonsReferenceInput = createReferenceInput(DETAIL_RESOURCES[0], DETAIL_PREFETCH[0]);
const curriculumsActionDefs: ResourceActionDefs = {};

export const languageChoices = [{ id: 'english', name: 'English' }, { id: 'hindi', name: 'Hindi' }, { id: 'kannada', name: 'Kannada' }, { id: 'spanish', name: 'Spanish' }, { id: 'tamil', name: 'Tamil' }, { id: 'telugu', name: 'Telugu' }];
export const LanguageChoiceField = (props: any) => <SelectField {...props} choices={languageChoices} />;

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="level_id" reference="levels" label="Level" />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />,
    <ReferenceLiveFilter source="standard_id" reference="standards" label="Standard" />,
    <ChoicesLiveFilter source="language" label="Language" choiceLabels={languageChoices} show />,
    <BooleanLiveFilter source="is_background_music_enabled" label="Background Music Enabled" />,
    <ReferenceLiveFilter source="background_music_id" reference="background_musics" label="Background Music" />
]

export const CurriculumsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['division_id', 'standard_id', 'language', 'is_background_music_enabled', 'background_music_id']} >
                <DataTable.Col source="name" />
                <DataTable.Col source="duration" />
                <DataTable.Col source="level_id" field={LevelsReferenceField}/>
                <DataTable.Col source="image_file_id" />
                <DataTable.Col source="status" />
                <DataTable.Col source="division_id" field={DivisionsReferenceField}/>
                <DataTable.Col source="standard_id" field={StandardsReferenceField}/>
                <DataTable.Col source="language" field={LanguageChoiceField} />
                <DataTable.Col source="is_background_music_enabled" field={BooleanField}/>
                <DataTable.Col source="background_music_id" field={BackgroundMusicsReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const CurriculumsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
                <TextField source="duration" />
                <LevelsReferenceField source="level_id" />
            </CardGrid>
        </List>
    )
}

const DetailResources = (props: any) => (
    <TabbedDetailLayout {...props}>
        <CurriculumLessonsList resource={DETAIL_RESOURCES[0]}/>
    </TabbedDetailLayout>
)

const CurriculumForm = (props: any) => {
    const record = useRecordContext();
    const isEdit = record?.id;
    return (
        <SimpleForm {...formDefaults(props)}>
            <Box width="100%" display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr' }} gap="1rem">
                <TextInput source="name" />
                <SelectInput source="language" choices={languageChoices} />
                <RichTextInput source="description" multiline rows={5} />
                {isEdit && <Box width='100%' display="grid" gap="1rem" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
                    <BackgroundMusicsReferenceInput source="background_music_id"/>
                    <BooleanInput source="is_background_music_enabled"/>
                    <TextInput source="image_file_id"/>
                </Box>}
            </Box>
            <DetailResources/>
        </SimpleForm>
    )
}

const CurriculumCreate = (props: any) => {
    return (
        <Create {...createDefaults(props)}>
            <CurriculumForm />
        </Create>
    )
}

const CurriculumEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <CurriculumForm/>
        </Edit>
    )
}

const CurriculumShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <TextField source="name" />
                <TextField source="description" />
                <TextField source="duration" />
                <LevelsReferenceField source="level_id" />
                <TextField source="image_file_id" />
                <TextField source="status" />
                <DivisionsReferenceField source="division_id" />
                <StandardsReferenceField source="standard_id" />
                <SelectField source="language" choices={languageChoices} />
                <BooleanField source="is_background_music_enabled" />
                <BackgroundMusicsReferenceField source="background_music_id" />
            </SimpleShowLayout>
            <DetailResources/>
        </Show>
    )
}

const curriculumsFieldSchema: FieldSchema = {
    name: {},
    description: { ui: 'multiline' },
    duration: {},
    level_id: { resource: 'levels' },
    image_file_id: {},
    status: {},
    division_id: { resource: 'divisions' },
    standard_id: { resource: 'standards' },
    language: { type: 'choice', ui: 'select', choices: languageChoices },
    is_background_music_enabled: {},
    background_music_id: { resource: 'background_musics' }
};

const detail0Filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="curriculum_id" reference="curricula" label="Curriculum" />,
    <ReferenceLiveFilter source="lesson_id" reference="lessons" label="Lesson" />,
    <NumberLiveFilter source="position_number" label="Position" />,
    <ReferenceLiveFilter source="mapping1_standard_section_id" reference="mapping1_standard_sections" label="Mapping1 Standard Section" />,
    <ReferenceLiveFilter source="mapping2_standard_section_id" reference="mapping2_standard_sections" label="Mapping2 Standard Section" />,
    <ReferenceLiveFilter source="mapping3_standard_section_id" reference="mapping3_standard_sections" label="Mapping3 Standard Section" />,
    <ReferenceLiveFilter source="mapping1_cognitive_skill_id" reference="mapping1_cognitive_skills" label="Mapping1 Cognitive Skill" />,
    <ReferenceLiveFilter source="mapping2_cognitive_skill_id" reference="mapping2_cognitive_skills" label="Mapping2 Cognitive Skill" />,
    <ReferenceLiveFilter source="mapping3_cognitive_skill_id" reference="mapping3_cognitive_skills" label="Mapping3 Cognitive Skill" />,
    <BooleanLiveFilter source="is_limit_to_show_single_section" label="Limit To Show Single Section" />,
    <BooleanLiveFilter source="is_game_sound_enabled" label="Game Sound Enabled" />,
    <BooleanLiveFilter source="is_voice_over_enabled" label="Voice Over Enabled" />
]

const CurriculumLessonForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <CurriculumsReferenceField source="curriculum_id">
                <AutocompleteInput validate={required()} />
            </CurriculumsReferenceField>
            <LessonsReferenceInput source="lesson_id" />
            <NumberInput source="position_number" />
            <TextInput source="mapping1_standard_section_id" />
            <TextInput source="mapping2_standard_section_id" />
            <TextInput source="mapping3_standard_section_id" />
            <TextInput source="mapping1_cognitive_skill_id" />
            <TextInput source="mapping2_cognitive_skill_id" />
            <TextInput source="mapping3_cognitive_skill_id" />
            <BooleanInput source="is_limit_to_show_single_section" />
            <BooleanInput source="is_game_sound_enabled" />
            <BooleanInput source="is_voice_over_enabled" />
        </SimpleForm>
    )
}

export const CurriculumLessonsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(props)} hiddenColumns={['mapping3_standard_section_id', 'mapping1_cognitive_skill_id', 'mapping2_cognitive_skill_id', 'mapping3_cognitive_skill_id', 'is_limit_to_show_single_section', 'is_game_sound_enabled', 'is_voice_over_enabled']} >
                <DataTable.Col source="curriculum_id" field={CurriculumsReferenceField}/>
                <DataTable.Col source="lesson_id" field={LessonsReferenceField}/>
                <DataTable.Col source="position_number" field={NumberField}/>
                <DataTable.Col source="mapping1_standard_section_id" />
                <DataTable.Col source="mapping2_standard_section_id" />
                <DataTable.Col source="mapping3_standard_section_id" />
                <DataTable.Col source="mapping1_cognitive_skill_id"/>
                <DataTable.Col source="mapping2_cognitive_skill_id"/>
                <DataTable.Col source="mapping3_cognitive_skill_id"/>
                <DataTable.Col source="is_limit_to_show_single_section" field={BooleanField}/>
                <DataTable.Col source="is_game_sound_enabled" field={BooleanField}/>
                <DataTable.Col source="is_voice_over_enabled" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const CurriculumLessonsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<CurriculumsReferenceField source="curriculum_id" variant='h6' link={false} />}>
                <LessonsReferenceField source="lesson_id" />
                <NumberField source="position_number" />
            </CardGrid>
        </List>
    )
}

const CurriculumLessonCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <CurriculumLessonForm />
        </Create>
    )
}

const CurriculumLessonEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <CurriculumLessonForm />
        </Edit>
    )
}

const CurriculumLessonShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr' }}  gap="1rem" >
                <CurriculumsReferenceField source="curriculum_id" />
                <LessonsReferenceField source="lesson_id" />
                <NumberField source="position_number" />
                <TextInput source="mapping1_standard_section_id" />
                <TextInput source="mapping2_standard_section_id" />
                <TextInput source="mapping3_standard_section_id" />
                <TextInput source="mapping1_cognitive_skill_id" />
                <TextInput source="mapping2_cognitive_skill_id" />
                <TextInput source="mapping3_cognitive_skill_id" />
                <BooleanField source="is_limit_to_show_single_section" />
                <BooleanField source="is_game_sound_enabled" />
                <BooleanField source="is_voice_over_enabled" />
            </SimpleShowLayout>
        </Show>
    )
}

export const CurriculumsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ curriculumsFieldSchema}
        actionDefs={ curriculumsActionDefs}
        filters={filters}
        filtersPlacement="top"
        list={<CurriculumsList/>}
        create={<CurriculumCreate/>}
        edit={<CurriculumEdit/>}
        show={<CurriculumShow/>}
        hasLiveUpdate
        hasFilterChooser
        cardList={<CurriculumsCardList/>}
        hasColumnChooser
        sort={{ field: 'name', order: 'ASC' }}
    />
)

const curriculumLessonsActionDefs: ResourceActionDefs = {};

const curriculumLessonsFieldSchema: FieldSchema = {
    curriculum_id: { required: true, resource: 'curricula' },
    lesson_id: { resource: 'lessons' },
    position_number: {},
    mapping1_standard_section_id: { resource: 'mapping1_standard_sections' },
    mapping2_standard_section_id: { resource: 'mapping2_standard_sections' },
    mapping3_standard_section_id: { resource: 'mapping3_standard_sections' },
    mapping1_cognitive_skill_id: { resource: 'mapping1_cognitive_skills' },
    mapping2_cognitive_skill_id: { resource: 'mapping2_cognitive_skills' },
    mapping3_cognitive_skill_id: { resource: 'mapping3_cognitive_skills' },
    is_limit_to_show_single_section: {},
    is_game_sound_enabled: {},
    is_voice_over_enabled: {}
};

const curriculumLessonsSearchableFields: string[] = [];

export const CurriculumLessonsResource = (
    <Resource
        name={DETAIL_RESOURCES[0]}
        icon={DETAIL_ICONS[0]}
        prefetch={DETAIL_PREFETCH[0]}
        recordRepresentation={(record: any) => `${recordRep(RESOURCE, record.curriculum)} ${recordRep('curricula', record.curriculum)}`}
        fieldSchema={curriculumLessonsFieldSchema}
        actionDefs={curriculumLessonsActionDefs}
        searchableFields={curriculumLessonsSearchableFields}
        cardList={<CurriculumLessonsCardList/>}
        filters={detail0Filters}
        filtersPlacement="top"
        list={<CurriculumLessonsList/>}
        create={<CurriculumLessonCreate/>}
        edit={<CurriculumLessonEdit/>}
        show={<CurriculumLessonShow/>}
        hasLiveUpdate
        hasColumnChooser
        hasFilterChooser
    />
)

export const CurriculumsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Curriculums" leftIcon={<ICON />} />
)

export const CurriculumLessonsMenu = () => (
    <Menu.Item to={`/${DETAIL_RESOURCES[0]}`} primaryText="Curriculum Lessons" leftIcon={<Category />} />
);
