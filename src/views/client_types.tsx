import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { People } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required} from "react-admin";

export const RESOURCE = "client_types"
export const ICON = People
export const PREFETCH: string[] = []

export const ClientTypesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ClientTypesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const clientTypesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const ClientTypesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const ClientTypesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const ClientTypeForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
        </SimpleForm>
    )
}

const ClientTypeEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <ClientTypeForm />
        </Edit>
    )
}

const ClientTypeCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <ClientTypeForm />
        </Create>
    )
}

const ClientTypeShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const clientTypesFieldSchema: FieldSchema = {
    name: { required: true }
};
const clientTypesSearchableFields: string[] = [
    'name'
];

export const ClientTypesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ clientTypesFieldSchema}
        actionDefs={ clientTypesActionDefs}
        searchableFields={ clientTypesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ClientTypesList/>}
        create={<ClientTypeCreate/>}
        edit={<ClientTypeEdit/>}
        show={<ClientTypeShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<ClientTypesCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const ClientTypesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Client Types" leftIcon={<ICON />} />
)
