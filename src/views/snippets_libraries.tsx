import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, BooleanLiveFilter, NumberLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { LibraryBooks } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, BooleanField, BooleanInput, NumberField, NumberInput} from "react-admin";

export const RESOURCE = "snippets_library"
export const ICON = LibraryBooks
export const PREFETCH: string[] = []

export const SnippetsLibrariesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const SnippetsLibrariesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const snippetsLibrariesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <NumberLiveFilter source="position_number" label="Position" />,
    <BooleanLiveFilter source="is_advanced" label="Advanced" />,
    <BooleanLiveFilter source="is_active" label="Active" />,
    <BooleanLiveFilter source="is_game_engine_active" label="Game Engine Active" />,
    <BooleanLiveFilter source="is_choice_1_correct" label="Choice 1 Correct" />,
    <BooleanLiveFilter source="is_choice_2_correct" label="Choice 2 Correct" />,
    <BooleanLiveFilter source="is_choice_3_correct" label="Choice 3 Correct" />
]

export const SnippetsLibrariesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['is_active', 'tag_ids', 'is_game_engine_active', 'starting_board', 'board_title', 'board_subtitle', 'additional_visuals', 'animated_tutorial', 'help', 'solution', 'goals', 'game_engine_guidance', 'choice_title', 'choice_hint', 'choice_1_text', 'choice_1_feedback', 'is_choice_1_correct', 'choice_2_text', 'choice_2_feedback', 'is_choice_2_correct', 'choice_3_text', 'choice_3_feedback', 'is_choice_3_correct']} >
                <DataTable.Col source="type" />
                <DataTable.Col source="title" />
                <DataTable.Col source="content" />
                <DataTable.Col source="position_number" field={NumberField}/>
                <DataTable.Col source="is_advanced" field={BooleanField}/>
                <DataTable.Col source="is_active" field={BooleanField}/>
                <DataTable.Col source="tag_ids" />
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
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const SnippetsLibrariesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="type" variant='h6' />}>
                <TextField source="title" />
                <TextField source="content" />
            </CardGrid>
        </List>
    )
}

const SnippetsLibraryForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <TextInput source="type" />
            <TextInput source="title" />
            <TextInput source="content" />
            <NumberInput source="position_number" />
            <BooleanInput source="is_advanced" />
            <BooleanInput source="is_active" />
            <TextInput source="tag_ids" />
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
        </SimpleForm>
    )
}

const SnippetsLibraryEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <SnippetsLibraryForm />
        </Edit>
    )
}

const SnippetsLibraryCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <SnippetsLibraryForm />
        </Create>
    )
}

const SnippetsLibraryShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <TextField source="type" />
                <TextField source="title" />
                <TextField source="content" />
                <NumberField source="position_number" />
                <BooleanField source="is_advanced" />
                <BooleanField source="is_active" />
                <TextField source="tag_ids" />
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
            </SimpleShowLayout>
        </Show>
    )
}

const snippetsLibrariesFieldSchema: FieldSchema = {
    type: {},
    title: {},
    content: {},
    position_number: {},
    is_advanced: {},
    is_active: {},
    tag_ids: {},
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
    is_choice_3_correct: {}
};
const snippetsLibrariesSearchableFields: string[] = [
    'title',
    'board_title',
    'choice_title',
    'type',
    'content',
    'tag_ids',
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
    'choice_3_feedback'
];

export const SnippetsLibrariesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ snippetsLibrariesFieldSchema}
        actionDefs={ snippetsLibrariesActionDefs}
        searchableFields={ snippetsLibrariesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<SnippetsLibrariesList/>}
        create={<SnippetsLibraryCreate/>}
        edit={<SnippetsLibraryEdit/>}
        show={<SnippetsLibraryShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<SnippetsLibrariesCardList/>}
        hasColumnChooser
        sort={{ field: 'title', order: 'ASC' }}
    />
)
export const SnippetsLibrariesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Snippets Libraries" leftIcon={<ICON />} />
)
