import {
    Resource,
    listDefaults,
    type ResourceActionDefs,
    type FieldSchema,
    CardGrid,
    createReferenceField,
    createReferenceInput,
    ChoicesLiveFilter,
    TextLiveFilter,
} from '@mahaswami/vc-frontend';
import { LibraryBooks } from '@mui/icons-material';
import { List, Menu, type ListProps, TextField, SelectField } from "react-admin";
import {LessonCreate, LessonEdit, LessonList, LessonShow} from "./curriculum/lessons.tsx";

export const RESOURCE = "lessons"
export const ICON = LibraryBooks
export const PREFETCH: string[] = []

export const LessonsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const LessonsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const lessonsActionDefs: ResourceActionDefs = {};

export const languageChoices = [{ id: 'EN', name: 'English' }, { id: 'HI', name: 'Hindi' }, { id: 'KN', name: 'Kannada' }, { id: 'ES', name: 'Spanish' }, { id: 'TA', name: 'Tamil' }, { id: 'TE', name: 'Telugu' }];
export const LanguageChoiceField = (props: any) => <SelectField {...props} choices={languageChoices} />;

const filters = [
    <TextLiveFilter source="search" show />,
    <ChoicesLiveFilter source="language" label="Language" choiceLabels={languageChoices} show />,
]

export const LessonsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
                <SelectField source="language" choices={languageChoices} />
                <TextField source="tag_ids" />
            </CardGrid>
        </List>
    )
}

const lessonsFieldSchema: FieldSchema = {
    name: { required: true, unique: true },
    language: { type: 'choice', ui: 'select', required: true, choices: languageChoices },
    tag_ids: {},
    division_id: { resource: 'divisions' },
    is_limit_to_show_single_section: {},
    content: { ui: 'rich', required: true }
};
const lessonsSearchableFields: string[] = [
    'name',
    'language',
    'tag_ids'
];

export const LessonsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ lessonsFieldSchema}
        actionDefs={ lessonsActionDefs}
        searchableFields={ lessonsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<LessonList/>}
        create={<LessonCreate/>}
        edit={<LessonEdit/>}
        show={<LessonShow/>}
        hasLiveUpdate
        hasFilterChooser
        cardList={<LessonsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const LessonsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="My Lessons" leftIcon={<ICON />} />
)
