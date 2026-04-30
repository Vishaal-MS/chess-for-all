import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, BooleanLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Category } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput} from "react-admin";

export const RESOURCE = "trophy_types"
export const ICON = Category
export const PREFETCH: string[] = []

export const TrophyTypesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const TrophyTypesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const trophyTypesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <BooleanLiveFilter source="is_active" label="Active" />,
    <DateLiveFilter source="created_date" label="Created" />
]

export const TrophyTypesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <DataTable.Col source="is_active" field={BooleanField}/>
                <DataTable.Col source="created_date" field={DateField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const TrophyTypesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
                <BooleanField source="is_active" />
                <DateField source="created_date" />
            </CardGrid>
        </List>
    )
}

const TrophyTypeForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" />
            <BooleanInput source="is_active" />
            <DateInput source="created_date" />
        </SimpleForm>
    )
}

const TrophyTypeEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <TrophyTypeForm />
        </Edit>
    )
}

const TrophyTypeCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <TrophyTypeForm />
        </Create>
    )
}

const TrophyTypeShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
                <BooleanField source="is_active" />
                <DateField source="created_date" />
            </SimpleShowLayout>
        </Show>
    )
}

const trophyTypesFieldSchema: FieldSchema = {
    name: {},
    is_active: {},
    created_date: {}
};
const trophyTypesSearchableFields: string[] = [
    'name'
];

export const TrophyTypesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ trophyTypesFieldSchema}
        actionDefs={ trophyTypesActionDefs}
        searchableFields={ trophyTypesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<TrophyTypesList/>}
        create={<TrophyTypeCreate/>}
        edit={<TrophyTypeEdit/>}
        show={<TrophyTypeShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<TrophyTypesCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const TrophyTypesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Trophy Types" leftIcon={<ICON />} />
)
