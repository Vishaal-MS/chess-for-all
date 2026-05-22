import {
    Resource, listDefaults, createReferenceField, createReferenceInput,
    type ResourceActionDefs, type FieldSchema, CardGrid, ChoicesLiveFilter, TextLiveFilter,
} from '@mahaswami/vc-frontend';
import { MenuBook} from '@mui/icons-material';
import { List, Menu, type ListProps, TextField } from "react-admin";
import { LevelsReferenceField } from './levels.js';
import {CurriculumCreate, CurriculumEdit, CurriculumList, CurriculumShow} from "./curriculum/curriculum.tsx";

export const RESOURCE = "curriculum"
export const DETAIL_RESOURCES: string[] = ["curriculum_lessons"]
export const ICON = MenuBook
export const PREFETCH: string[] = ["levels", "divisions", "standards", "background_music"]

export const CurriculumsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const CurriculumsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
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

export const CurriculumsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="My Curriculums" leftIcon={<ICON />} />
)
