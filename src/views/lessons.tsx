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
    type ResourceActionDefs,
    type FieldSchema,
    RichTextField,
    CardGrid,
    createReferenceField,
    createReferenceInput,
    BooleanLiveFilter,
    ReferenceLiveFilter,
    ChoicesLiveFilter,
    TextLiveFilter,
    RichTextInput
} from '@mahaswami/vc-frontend';
import { Book } from '@mui/icons-material';
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
    SelectField,
    SelectInput,
    required,
    useUnique,
    ReferenceArrayInput, AutocompleteArrayInput
} from "react-admin";
import { DivisionsReferenceField } from './divisions.js';
import {Box} from "@mui/material";
// import {ChessAIInput} from "../fields/ai_lesson/ChessAIInput.tsx";

export const RESOURCE = "lessons"
export const ICON = Book
export const PREFETCH: string[] = ["divisions"]

export const LessonsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const LessonsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const lessonsActionDefs: ResourceActionDefs = {};

export const languageChoices = [{ id: 'english', name: 'English' }, { id: 'hindi', name: 'Hindi' }, { id: 'kannada', name: 'Kannada' }, { id: 'spanish', name: 'Spanish' }, { id: 'tamil', name: 'Tamil' }, { id: 'telugu', name: 'Telugu' }];
export const LanguageChoiceField = (props: any) => <SelectField {...props} choices={languageChoices} />;

const filters = [
    <TextLiveFilter source="search" show />,
    <ChoicesLiveFilter source="language" label="Language" choiceLabels={languageChoices} show />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />,
    <BooleanLiveFilter source="is_limit_to_show_single_section" label="Limit To Show Single Section" />
]

export const LessonsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <DataTable.Col source="language" field={LanguageChoiceField} />
                <DataTable.Col source="tag_ids" />
                <DataTable.Col source="division_id" field={DivisionsReferenceField}/>
                <DataTable.Col source="is_limit_to_show_single_section" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

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

const LessonForm = (props: any) => {
    const unique = useUnique();
    return (
        <SimpleForm {...formDefaults(props)}>
            <Box width='100%' display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap="1rem">
                <TextInput source="name" validate={[required(), unique()]} />
                <BooleanInput source="is_limit_to_show_single_section" />
                <SelectInput source="language" choices={languageChoices} validate={required()} />
                <ReferenceArrayInput source="tag_ids" reference="tags" queryOptions={{meta: {scopingEscapeHatch:true}}}
                                     perPage={1000} sort={{ field: 'name', order: 'ASC' }}>
                    <AutocompleteArrayInput label="Tags" />
                </ReferenceArrayInput>
            </Box>
            {/*<ChessAIInput source="content" validate={required()} fullWidth />*/}
        </SimpleForm>
    )
}

const LessonEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <LessonForm />
        </Edit>
    )
}

const LessonCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <LessonForm />
        </Create>
    )
}

const LessonShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap="1rem">
                    <TextField source="name" />
                    <BooleanField source="is_limit_to_show_single_section" />
                    <SelectField source="language" choices={languageChoices} />
                    <TextField source="tag_ids" />
                </Box>
                <DivisionsReferenceField source="division_id" />
                {/*<Ch source="content" />*/}
            </SimpleShowLayout>
        </Show>
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
        list={<LessonsList/>}
        create={<LessonCreate/>}
        edit={<LessonEdit/>}
        show={<LessonShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<LessonsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const LessonsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Lessons" leftIcon={<ICON />} />
)
