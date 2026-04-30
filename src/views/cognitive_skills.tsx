import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Psychology } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required} from "react-admin";

export const RESOURCE = "cognitive_skills"
export const ICON = Psychology
export const PREFETCH: string[] = []

export const CognitiveSkillsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const CognitiveSkillsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const cognitiveSkillsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const CognitiveSkillsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const CognitiveSkillsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const CognitiveSkillForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
        </SimpleForm>
    )
}

const CognitiveSkillEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <CognitiveSkillForm />
        </Edit>
    )
}

const CognitiveSkillCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <CognitiveSkillForm />
        </Create>
    )
}

const CognitiveSkillShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const cognitiveSkillsFieldSchema: FieldSchema = {
    name: { required: true }
};
const cognitiveSkillsSearchableFields: string[] = [
    'name'
];

export const CognitiveSkillsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ cognitiveSkillsFieldSchema}
        actionDefs={ cognitiveSkillsActionDefs}
        searchableFields={ cognitiveSkillsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<CognitiveSkillsList/>}
        create={<CognitiveSkillCreate/>}
        edit={<CognitiveSkillEdit/>}
        show={<CognitiveSkillShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<CognitiveSkillsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const CognitiveSkillsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Cognitive Skills" leftIcon={<ICON />} />
)
