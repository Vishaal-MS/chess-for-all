import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Description } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required} from "react-admin";

export const RESOURCE = "standards"
export const ICON = Description
export const PREFETCH: string[] = []

export const StandardsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const StandardsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const standardsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const StandardsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const StandardsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const StandardForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
        </SimpleForm>
    )
}

const StandardEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <StandardForm />
        </Edit>
    )
}

const StandardCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <StandardForm />
        </Create>
    )
}

const StandardShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const standardsFieldSchema: FieldSchema = {
    name: { required: true }
};
const standardsSearchableFields: string[] = [
    'name'
];

export const StandardsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ standardsFieldSchema}
        actionDefs={ standardsActionDefs}
        searchableFields={ standardsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<StandardsList/>}
        create={<StandardCreate/>}
        edit={<StandardEdit/>}
        show={<StandardShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<StandardsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const StandardsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Standards" leftIcon={<ICON />} />
)
