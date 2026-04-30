import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, SimpleFileField, SimpleFileInput, CardGrid, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { School } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, BooleanField, BooleanInput, SelectField} from "react-admin";
import { DivisionsReferenceField, DivisionsReferenceInput } from './divisions.js';

export const RESOURCE = "lesson_blocks"
export const ICON = School
export const PREFETCH: string[] = ["divisions", "ccai_pubs"]

export const LessonBlocksReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const LessonBlocksReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const lessonBlocksActionDefs: ResourceActionDefs = {};

export const blockTypeChoices = [{ id: 'animated_tutorial', name: 'Animated Tutorial' }, { id: 'guided_exercise', name: 'Guided Exercise' }, { id: 'exercise', name: 'Exercise' }, { id: 'mcq', name: 'MCQ' }, { id: 'pgn', name: 'PGN' }, { id: 'plain_question_&_answer', name: 'Plain Question & Answer' }];
export const BlockTypeChoiceField = (props: any) => <SelectField {...props} choices={blockTypeChoices} />;

const filters = [
    <TextLiveFilter source="search" show />,
    <BooleanLiveFilter source="is_game_engine_active" label="Game Engine Active" />,
    <BooleanLiveFilter source="is_choice_1_correct" label="Choice 1 Correct" />,
    <BooleanLiveFilter source="is_choice_2_correct" label="Choice 2 Correct" />,
    <BooleanLiveFilter source="is_choice_3_correct" label="Choice 3 Correct" />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />,
    <ReferenceLiveFilter source="ccai_pub_id" reference="ccai_pubs" label="Ccai Pub" />,
    <BooleanLiveFilter source="is_hide_board" label="Hide Board" />
]

export const LessonBlocksList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['board_subtitle', 'additional_visuals', 'animated_tutorial', 'help', 'solution', 'goals', 'game_engine_guidance', 'choice_title', 'choice_hint', 'choice_1_text', 'choice_1_feedback', 'is_choice_1_correct', 'choice_2_text', 'choice_2_feedback', 'is_choice_2_correct', 'choice_3_text', 'choice_3_feedback', 'is_choice_3_correct', 'pgn', 'block_description', 'division_id', 'tag_ids', 'ccai_pub_id', 'question', 'number_of_lines', 'number_of_words', 'expected_answer', 'is_hide_board', 'sound_sprites_json', 'sound_message_keys', 'voice_key']} >
                <DataTable.Col source="name" />
                <DataTable.Col source="block_type" />
                <DataTable.Col source="is_game_engine_active" field={BooleanField}/>
                <DataTable.Col source="starting_board" />
                <DataTable.Col source="board_title" />
                <DataTable.Col source="board_subtitle" />
                <DataTable.Col source="additional_visuals" />
                <DataTable.Col source="animated_tutorial" />
                <DataTable.Col source="help" />
                <DataTable.Col source="solution" />
                <DataTable.Col source="goals" />
                <DataTable.Col source="game_engine_guidance" />
                <DataTable.Col source="choice_title" />
                <DataTable.Col source="choice_hint" />
                <DataTable.Col source="choice_1_text" />
                <DataTable.Col source="choice_1_feedback" />
                <DataTable.Col source="is_choice_1_correct" field={BooleanField}/>
                <DataTable.Col source="choice_2_text" />
                <DataTable.Col source="choice_2_feedback" />
                <DataTable.Col source="is_choice_2_correct" field={BooleanField}/>
                <DataTable.Col source="choice_3_text" />
                <DataTable.Col source="choice_3_feedback" />
                <DataTable.Col source="is_choice_3_correct" field={BooleanField}/>
                <DataTable.Col source="pgn" />
                <DataTable.Col source="block_description" />
                <DataTable.Col source="division_id" field={DivisionsReferenceField}/>
                <DataTable.Col source="tag_ids" />
                <DataTable.Col source="question" />
                <DataTable.Col source="number_of_lines" />
                <DataTable.Col source="number_of_words" />
                <DataTable.Col source="expected_answer" />
                <DataTable.Col source="is_hide_board" field={BooleanField}/>
                <DataTable.Col source="sound_sprites_json" />
                <DataTable.Col source="sound_message_keys" />
                <DataTable.Col source="voice_key" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const LessonBlocksCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
                <TextField source="block_type" />
                <BooleanField source="is_game_engine_active" />
            </CardGrid>
        </List>
    )
}

const LessonBlockForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <TextInput source="name" />
            <TextInput source="block_type" />
            <BooleanInput source="is_game_engine_active" />
            <TextInput source="starting_board" />
            <TextInput source="board_title" />
            <TextInput source="board_subtitle" />
            <TextInput source="additional_visuals" />
            <TextInput source="animated_tutorial" />
            <TextInput source="help" />
            <TextInput source="solution" />
            <TextInput source="goals" />
            <TextInput source="game_engine_guidance" />
            <TextInput source="choice_title" />
            <TextInput source="choice_hint" />
            <TextInput source="choice_1_text" />
            <TextInput source="choice_1_feedback" />
            <BooleanInput source="is_choice_1_correct" />
            <TextInput source="choice_2_text" />
            <TextInput source="choice_2_feedback" />
            <BooleanInput source="is_choice_2_correct" />
            <TextInput source="choice_3_text" />
            <TextInput source="choice_3_feedback" />
            <BooleanInput source="is_choice_3_correct" />
            <TextInput source="pgn" />
            <TextInput source="block_description" />
            <DivisionsReferenceInput source="division_id" />
            <TextInput source="tag_ids" />
            <CcaiPubsReferenceInput source="ccai_pub_id" />
            <TextInput source="question" />
            <TextInput source="number_of_lines" />
            <TextInput source="number_of_words" />
            <TextInput source="expected_answer" />
            <BooleanInput source="is_hide_board" />
            <SimpleFileInput source="sound_attachment_file_id" />
            <SimpleFileField source="sound_attachment_file_id" title="sound_attachment_file_name" />
            <TextInput source="sound_sprites_json" />
            <TextInput source="sound_message_keys" />
            <TextInput source="voice_key" />
        </SimpleForm>
    )
}

const LessonBlockEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <LessonBlockForm />
        </Edit>
    )
}

const LessonBlockCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <LessonBlockForm />
        </Create>
    )
}

const LessonBlockShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <TextField source="name" />
                <TextField source="block_type" />
                <BooleanField source="is_game_engine_active" />
                <TextField source="starting_board" />
                <TextField source="board_title" />
                <TextField source="board_subtitle" />
                <TextField source="additional_visuals" />
                <TextField source="animated_tutorial" />
                <TextField source="help" />
                <TextField source="solution" />
                <TextField source="goals" />
                <TextField source="game_engine_guidance" />
                <TextField source="choice_title" />
                <TextField source="choice_hint" />
                <TextField source="choice_1_text" />
                <TextField source="choice_1_feedback" />
                <BooleanField source="is_choice_1_correct" />
                <TextField source="choice_2_text" />
                <TextField source="choice_2_feedback" />
                <BooleanField source="is_choice_2_correct" />
                <TextField source="choice_3_text" />
                <TextField source="choice_3_feedback" />
                <BooleanField source="is_choice_3_correct" />
                <TextField source="pgn" />
                <TextField source="block_description" />
                <DivisionsReferenceField source="division_id" />
                <TextField source="tag_ids" />
                <TextField source="question" />
                <TextField source="number_of_lines" />
                <TextField source="number_of_words" />
                <TextField source="expected_answer" />
                <BooleanField source="is_hide_board" />
                <SimpleFileField source="sound_attachment_file_id" title="sound_attachment_file_name" />
                <TextField source="sound_sprites_json" />
                <TextField source="sound_message_keys" />
                <TextField source="voice_key" />
            </SimpleShowLayout>
        </Show>
    )
}

const lessonBlocksFieldSchema: FieldSchema = {
    name: {},
    block_type: { type: 'choice', choices: blockTypeChoices },
    is_game_engine_active: {},
    starting_board: {},
    board_title: {},
    board_subtitle: {},
    additional_visuals: {},
    animated_tutorial: {},
    help: {},
    solution: {},
    goals: {},
    game_engine_guidance: {},
    choice_title: {},
    choice_hint: {},
    choice_1_text: {},
    choice_1_feedback: {},
    is_choice_1_correct: {},
    choice_2_text: {},
    choice_2_feedback: {},
    is_choice_2_correct: {},
    choice_3_text: {},
    choice_3_feedback: {},
    is_choice_3_correct: {},
    pgn: {},
    block_description: {},
    division_id: { resource: 'divisions' },
    tag_ids: {},
    ccai_pub_id: { resource: 'ccai_pubs' },
    question: {},
    number_of_lines: {},
    number_of_words: {},
    expected_answer: {},
    is_hide_board: {},
    sound_attachment_file_id: {},
    sound_sprites_json: {},
    sound_message_keys: {},
    voice_key: {}
};
const lessonBlocksSearchableFields: string[] = [
    'name',
    'board_title',
    'choice_title',
    'block_type',
    'starting_board',
    'board_subtitle',
    'additional_visuals',
    'animated_tutorial',
    'help',
    'solution',
    'goals',
    'game_engine_guidance',
    'choice_hint',
    'choice_1_text',
    'choice_1_feedback',
    'choice_2_text',
    'choice_2_feedback',
    'choice_3_text',
    'choice_3_feedback',
    'pgn',
    'block_description',
    'tag_ids',
    'question',
    'number_of_lines',
    'number_of_words',
    'expected_answer',
    'sound_sprites_json',
    'sound_message_keys',
    'voice_key'
];

export const LessonBlocksResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ lessonBlocksFieldSchema}
        actionDefs={ lessonBlocksActionDefs}
        searchableFields={ lessonBlocksSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<LessonBlocksList/>}
        create={<LessonBlockCreate/>}
        edit={<LessonBlockEdit/>}
        show={<LessonBlockShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<LessonBlocksCardList/>}
        hasColumnChooser
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const LessonBlocksMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Lesson Blocks" leftIcon={<ICON />} />
)
