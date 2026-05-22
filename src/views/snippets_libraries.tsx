import {
    Resource,
    type ResourceActionDefs,
    type FieldSchema,
    createReferenceField,
    createReferenceInput,
    TextLiveFilter,
    ChoicesLiveFilter,
    listDefaults,
    DataTable, tableDefaults, showDefaults, editDefaults, SimpleForm, formDefaults
} from '@mahaswami/vc-frontend';
import { LibraryBooks } from '@mui/icons-material';
import {
    AutocompleteArrayInput, BooleanField, BooleanInput, Create, Edit,
    List,
    Menu, NumberField, NumberInput,
    ReferenceArrayField,
    ReferenceArrayInput,
    SelectInput, Show, SimpleShowLayout, SingleFieldList, TextField, TextInput
} from "react-admin";
import {
    getTypeChoices
} from "./snippets_library/SnippetsLibrary.tsx";
import {Grid} from "@mui/material";

export const RESOURCE = "snippets_library"
export const ICON = LibraryBooks
export const PREFETCH: string[] = []

export const SnippetsLibrariesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const SnippetsLibrariesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const snippetsLibrariesActionDefs: ResourceActionDefs = {};

export const choices = [{id: true, name: 'Yes'}, {id: false, name: 'No'}];
export const typeChoices = [
    { id: 'Animated Tutorial', name: 'Animated Tutorial' },
    { id: 'Guided Exercise', name: 'Guided Exercise' },
    { id: 'Exercise', name: 'Exercise' },
    { id: 'Mcq', name: 'Mcq' },
    { id: 'Pgn', name: 'Pgn' }
];

const filters = [
    <TextLiveFilter source="search" show/>,
    <ChoicesLiveFilter source="type" choiceLabels={typeChoices} />,
    <ChoicesLiveFilter label="Active?" source="is_active" choiceLabels={choices} />,
    <ChoicesLiveFilter label="Advanced?" source="is_advanced" choiceLabels={choices} />
];

export const SnippetsLibraryList = (props: any) => {
    return (
        <List { ...listDefaults(props)} exporter={false}
              sort={{ field: 'position_number', order: "ASC" }}>
            <DataTable { ...tableDefaults(RESOURCE)} bulkActionButtons={false}>
                <DataTable.Col source="title"/>
                <DataTable.Col source="type"/>
                <DataTable.Col label="Tags" field={() =>
                    <ReferenceArrayField source="tag_ids" reference="tags" perPage={1000}>
                        <SingleFieldList linkType={false} />
                    </ReferenceArrayField>} />
                <DataTable.Col source="position_number" field={NumberField}/>
                <DataTable.Col label="Active?" source="is_active" field={BooleanField}/>
                <DataTable.Col label="Advanced?" source="is_advanced" field={BooleanField}/>
            </DataTable>
        </List>
    );
}
export const SnippetsLibraryShow = (props) => (
    <Show { ...showDefaults(props)}>
        <SimpleShowLayout>
            <TextField source="title"/>
            <TextField source="type"/>
            <NumberField source="position_number"/>
            <BooleanField label="Active?" source="is_active"/>
            <BooleanField label="Advanced?" source="is_advanced"/>
            <TextField source="content"/>
        </SimpleShowLayout>
    </Show>
);

export const SnippetsLibraryCreate = () => (
    <Create>
        <CreateAndEditForm />
    </Create>
);

export const SnippetsLibraryEdit = (props) => (
    <Edit {...editDefaults(props)} redirect={"show"} mutationMode="pessimistic">
        <CreateAndEditForm />
    </Edit>
);

const CreateAndEditForm = (props) => {
    return (
        <SimpleForm {...formDefaults(props)} resource="snippets_library">
            <TextInput source="title"/>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <SelectInput source="type" choices={getTypeChoices()} label="Type"/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <NumberInput source="position_number"/>
                </Grid>
            </Grid>
            <ReferenceArrayInput source="tag_ids" reference="tags" sort={{field: 'name', order: 'ASC'}}
                                 queryOptions={{meta: {scopingEscapeHatch: true}}} perPage={1000}>
                <AutocompleteArrayInput label="Tags"/>
            </ReferenceArrayInput>
            <BooleanInput label="Active?" source="is_active"/>
            <BooleanInput label="Advanced?" source="is_advanced"/>
            <TextInput source="content" multiline minRows={5} maxRows={10}/>
        </SimpleForm>
    );
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
        list={<SnippetsLibraryList/>}
        create={<SnippetsLibraryCreate/>}
        edit={<SnippetsLibraryEdit/>}
        show={<SnippetsLibraryShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'title', order: 'ASC' }}
    />
)
export const SnippetsLibrariesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Snippets Libraries" leftIcon={<ICON />} />
)
