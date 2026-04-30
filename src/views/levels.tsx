import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Category } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput} from "react-admin";

export const RESOURCE = "levels"
export const ICON = Category
export const PREFETCH: string[] = []

export const LevelsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const LevelsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const levelsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const LevelsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const LevelsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const LevelForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" />
        </SimpleForm>
    )
}

const LevelEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <LevelForm />
        </Edit>
    )
}

const LevelCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <LevelForm />
        </Create>
    )
}

const LevelShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const levelsFieldSchema: FieldSchema = {
    name: {}
};
const levelsSearchableFields: string[] = [
    'name'
];

export const LevelsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ levelsFieldSchema}
        actionDefs={ levelsActionDefs}
        searchableFields={ levelsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<LevelsList/>}
        create={<LevelCreate/>}
        edit={<LevelEdit/>}
        show={<LevelShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<LevelsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const LevelsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Levels" leftIcon={<ICON />} />
)
