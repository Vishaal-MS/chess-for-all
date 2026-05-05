import {
    Resource,
    createDefaults,
    tableDefaults,
    editDefaults,
    listDefaults,
    showDefaults,
    DataTable,
    SimpleShowLayout,
    SimpleForm,
    type ResourceActionDefs,
    type FieldSchema,
    CardGrid,
    createReferenceField,
    createReferenceInput,
    BooleanLiveFilter,
    ReferenceLiveFilter,
    TextLiveFilter,
} from '@mahaswami/vc-frontend';
import { School } from '@mui/icons-material';
import {
    Create, Edit, List, Menu, Show,
    type ListProps, TextInput, BooleanField, BooleanInput, ReferenceArrayInput, AutocompleteArrayInput,
    SelectField, TopToolbar, Button, SelectInput, WithRecord, FormDataConsumer, NumberInput, TextField
} from "react-admin";
import {useLocation, useNavigate} from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import {Typography, Box} from "@mui/material";
import {LessonBlockForm} from "./curriculum/LessonBlockForm.tsx";


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

const LessonBlockListActions = () => {
    const navigate = useNavigate();

    return(
        <TopToolbar>
            <Button startIcon={<AddIcon />} label={"AI Lesson Block"} onClick={() => navigate("/lesson_blocks/create?param=AI_NEW")}/>
            <Button startIcon={<AddIcon />} label={"Advanced Lesson Block"} onClick={() => navigate("/lesson_blocks/create?param=ADVANCE_NEW")}/>
        </TopToolbar>
    );
}

const CustomEmptyList = () => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="calc(100vh - 200px)"
        >
            <Typography sx={{color: 'grey'}} variant="h4" gutterBottom>
                No Lesson Blocks yet
            </Typography>
            <LessonBlockListActions/>
        </Box>
    )};

export const LessonBlocksList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} actions={<LessonBlockListActions/>} empty={<CustomEmptyList/>} redirect={"edit"}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['board_subtitle', 'additional_visuals', 'animated_tutorial', 'help', 'solution', 'goals', 'game_engine_guidance', 'choice_title', 'choice_hint', 'choice_1_text', 'choice_1_feedback', 'is_choice_1_correct', 'choice_2_text', 'choice_2_feedback', 'is_choice_2_correct', 'choice_3_text', 'choice_3_feedback', 'is_choice_3_correct', 'pgn', 'block_description', 'division_id', 'tag_ids', 'ccai_pub_id', 'question', 'number_of_lines', 'number_of_words', 'expected_answer', 'is_hide_board', 'sound_sprites_json', 'sound_message_keys', 'voice_key']} >
                <DataTable.Col source="name" />
                <DataTable.Col source="block_type" />
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


const LessonBlockEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}  mutationMode="pessimistic" >
            <WithRecord render={record => {
                const location = useLocation();
                const params = new URLSearchParams(location.search);
                const paramMode = params.get("param");
                if (!record.block_description || paramMode == "DEBUG_ADVANCED_EDIT") {
                    return <AdvanceForm editForm={true}/>
                } else {
                    return <LessonBlockForm recordData={record} formMode={"AI_EDIT"}/>
                }
            }} />
        </Edit>
    )
}

const fenStartingBoard = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

const ChoiceCorrect = ({rest, index, data}) => {
    const currentIndex = [1,2,3].find(i => data[`is_choice_${i}_correct`]);

    return <BooleanInput readOnly={currentIndex && currentIndex !== index} source={`is_choice_${index}_correct`} label={`Correct`} {...rest} sx={{p: "0.5rem"}}/> ;
}

const BoardFields = (
    <>
        <TextInput required source="board_title" label="Board Title" />
        <TextInput source="board_subtitle" label="Board Subtitle" />
        <TextInput source="starting_board" label="Starting Board" defaultValue={fenStartingBoard}/>
        <BooleanInput source="is_game_engine_active" defaultValue={true} label="Game Engine?" />
        <TextInput multiline source="additional_visuals" label="Additional Visuals" maxRows={8}/>
    </>
)

export const AdvanceForm = ({editForm}) => (
    <SimpleForm id="lesson_block" sx={{px: editForm ? 2 : 0, padding: editForm ? '1em' : 0}} toolbar={!editForm  ? false : undefined}>
        {editForm && <TextInput required source="name" />}
        <SelectInput required source="block_type" label="Block Type" choices={blockTypeChoices} defaultValue={'pgn'} />
        <ReferenceArrayInput source="tag_ids" reference="tags" queryOptions={{meta: {scopingEscapeHatch: true}}}
                             perPage={1000} sort={{field: 'name', order: 'ASC'}}>
            <AutocompleteArrayInput label="Tags" source="tag_ids"
                                    onChange={(value) => {
                                        const hiddenInput = document.getElementById("tag_ids_hidden");
                                        if (hiddenInput) {
                                            hiddenInput.value = JSON.stringify(value);
                                        }
                                    }}
            />
        </ReferenceArrayInput>
        <input type="hidden" name="tag_ids" id="tag_ids_hidden" />
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'mcq' && (
                <BooleanInput source="is_hide_board" defaultValue={false} label="Hide Board?" key={"hide_board"} />
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type == "mcq" &&
                formData.is_hide_board == false && (BoardFields)}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => !["pgn", "pqa", "mcq"].includes(formData.block_type) && (BoardFields)}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) =>
                formData.block_type === 'animated_tutorial' && (
                    <TextInput multiline source="animated_tutorial" label="Animated Tutorial" {...rest} maxRows={8}/>
                )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'guided_exercise' && (
                <>
                    <TextInput multiline source="goals" {...rest} maxRows={8}/>
                    <TextInput source="help" {...rest} />
                    <TextInput source="solution" {...rest} />
                </>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'exercise' && (
                <>
                    <TextInput multiline source="goals" {...rest} maxRows={8}/>
                    <TextInput source="game_engine_guidance" label="Game Engine Guidance" {...rest} />
                </>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'mcq' && (
                <>
                    {formData.block_type == "mcq" && formData.is_hide_board == false && <TextInput multiline source="goals" {...rest} maxRows={8}/>}
                    <TextInput label="MCQ title" source="choice_title" {...rest} />
                    <TextInput label="MCQ hint" source="choice_hint" {...rest} />
                    {/* Show a group of inputs - 'Text', 'Feedback', 'Correct' (true or false) for each input*/}
                    {[1,2,3].map((index) => (
                        <Box key={index} sx={{ display: 'flex', flexDirection: 'row', marginBottom: "1rem" }}>
                            <TextInput source={`choice_${index}_text`} label={`MCQ ${index}`} {...rest} sx={{p: "0.5rem"}}/>
                            <TextInput source={`choice_${index}_feedback`} label={`Feedback ${index}`} {...rest} sx={{p: "0.5rem"}}/>
                            <ChoiceCorrect rest={rest} index={index} data={formData}/>
                        </Box>))}
                </>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'pgn' && (
                <TextInput source="pgn" multiline label="PGN" {...rest} rows={12}/>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => ["pqa"].includes(formData.block_type) && (
                <>
                    <TextInput multiline minRows={3} source="question" label="Question?" {...rest} />
                    <TextInput multiline minRows={3} source="expected_answer" label="Expected Answer" {...rest} />
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: "100%" }}>
                        <NumberInput source="number_of_lines" label="Number of Lines" {...rest} />
                        <NumberInput source="number_of_words" label="Number of Words" {...rest} />
                    </Box>
                </>
            )}
        </FormDataConsumer>
    </SimpleForm>
);

const LessonBlockCreate = (props: any) => {
    return (
        <Create {...createDefaults(props)} title={"New Lesson Block"}>
            <LessonBlockForm formMode={"AI_NEW"}/>
        </Create>
    )
}

const LessonBlockShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <TextField source="name" />
                <TextField source="block_type" />
                <TextField source="animated_tutorial" />
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
        // hasDialog
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
