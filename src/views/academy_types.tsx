import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { School } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required} from "react-admin";

export const RESOURCE = "academy_types"
export const ICON = School
export const PREFETCH: string[] = []

export const AcademyTypesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const AcademyTypesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const academyTypesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const AcademyTypesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const AcademyTypesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const AcademyTypeForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
        </SimpleForm>
    )
}

const AcademyTypeEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <AcademyTypeForm />
        </Edit>
    )
}

const AcademyTypeCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <AcademyTypeForm />
        </Create>
    )
}

const AcademyTypeShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const academyTypesFieldSchema: FieldSchema = {
    name: { required: true }
};
const academyTypesSearchableFields: string[] = [
    'name'
];

export const AcademyTypesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ academyTypesFieldSchema}
        actionDefs={ academyTypesActionDefs}
        searchableFields={ academyTypesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<AcademyTypesList/>}
        create={<AcademyTypeCreate/>}
        edit={<AcademyTypeEdit/>}
        show={<AcademyTypeShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<AcademyTypesCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const AcademyTypesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Academy Types" leftIcon={<ICON />} />
)
