import { Resource, type ResourceActionDefs, type FieldSchema, createReferenceField,
    createReferenceInput, BooleanLiveFilter, NumberLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { LibraryBooks } from '@mui/icons-material';
import { Menu } from "react-admin";
import {
    SnippetsLibraryCreate,
    SnippetsLibraryEdit,
    SnippetsLibraryList,
    SnippetsLibraryShow
} from "./snippets_library/SnippetsLibrary.tsx";

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
