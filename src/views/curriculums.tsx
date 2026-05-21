import {
    Resource,
    createDefaults,
    tableDefaults,
    editDefaults,
    formDefaults,
    listDefaults,
    RowActions,
    DataTable,
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
    type ListProps,
    TextField,
    TextInput,
    BooleanField,
    BooleanInput,
    NumberField,
    NumberInput,
    SelectInput,
    AutocompleteInput,
    required,
    useRecordContext
} from "react-admin";
import { LevelsReferenceField } from './levels.js';
import { BackgroundMusicsReferenceInput } from './background_musics.js';
import { LessonsReferenceField, LessonsReferenceInput } from './lessons.js';
import { Box } from '@mui/material';
import {CurriculumEdit, CurriculumList, CurriculumShow} from "./curriculum/curriculum.tsx";

export const RESOURCE = "curriculum"
export const DETAIL_RESOURCES: string[] = ["curriculum_lessons"]
export const ICON = MenuBook
export const DETAIL_ICONS: any[] = [Category]
export const PREFETCH: string[] = ["levels", "divisions", "standards", "background_music"]
export const DETAIL_PREFETCH: string[][] = [[RESOURCE, "lessons"]]

export const CurriculumsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const CurriculumsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
export const CurriculumLessonsReferenceField = createReferenceField(DETAIL_RESOURCES[0], DETAIL_PREFETCH[0]);
export const CurriculumLessonsReferenceInput = createReferenceInput(DETAIL_RESOURCES[0], DETAIL_PREFETCH[0]);
const curriculumsActionDefs: ResourceActionDefs = {};

export const languageChoices = [{ id: 'english', name: 'English' }, { id: 'hindi', name: 'Hindi' }, { id: 'kannada', name: 'Kannada' }, { id: 'spanish', name: 'Spanish' }, { id: 'tamil', name: 'Tamil' }, { id: 'telugu', name: 'Telugu' }];

const filters = [
    <TextLiveFilter source="search" show />,
    <ChoicesLiveFilter source="language" label="Language" choiceLabels={languageChoices} show />
]

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
    background_music_id: { resource: 'background_music' }
};

const detail0Filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="curriculum_id" reference="curricula" label="Curriculum" />,
    <ReferenceLiveFilter source="lesson_id" reference="lessons" label="Lesson" />,
    <NumberLiveFilter source="position_number" label="Position" />,
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

export const CurriculumsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ curriculumsFieldSchema}
        actionDefs={ curriculumsActionDefs}
        filters={filters}
        filtersPlacement="top"
        list={<CurriculumList/>}
        create={<CurriculumCreate/>}
        edit={<CurriculumEdit/>}
        show={<CurriculumShow/>}
        hasLiveUpdate
        hasFilterChooser
        cardList={<CurriculumsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)

const curriculumLessonsActionDefs: ResourceActionDefs = {};

const curriculumLessonsFieldSchema: FieldSchema = {
    curriculum_id: { required: true, resource: 'curriculum' },
    lesson_id: { resource: 'lessons' },
    position_number: {},
    mapping1_standard_section_id: {},
    mapping2_standard_section_id: {},
    mapping3_standard_section_id: {},
    mapping1_cognitive_skill_id: {},
    mapping2_cognitive_skill_id: {},
    mapping3_cognitive_skill_id: {},
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
        hasLiveUpdate
        hasColumnChooser
        hasFilterChooser
    />
)

export const CurriculumsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="My Curriculums" leftIcon={<ICON />} />
)

export const CurriculumLessonsMenu = () => (
    <Menu.Item to={`/${DETAIL_RESOURCES[0]}`} primaryText="Curriculum Lessons" leftIcon={<Category />} />
);
