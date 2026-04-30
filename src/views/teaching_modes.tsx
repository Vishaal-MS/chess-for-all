import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { School } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required} from "react-admin";

export const RESOURCE = "teaching_modes"
export const ICON = School
export const PREFETCH: string[] = []

export const TeachingModesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const TeachingModesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const teachingModesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const TeachingModesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const TeachingModesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const TeachingModeForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
        </SimpleForm>
    )
}

const TeachingModeEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <TeachingModeForm />
        </Edit>
    )
}

const TeachingModeCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <TeachingModeForm />
        </Create>
    )
}

const TeachingModeShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const teachingModesFieldSchema: FieldSchema = {
    name: { required: true }
};
const teachingModesSearchableFields: string[] = [
    'name'
];

export const TeachingModesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ teachingModesFieldSchema}
        actionDefs={ teachingModesActionDefs}
        searchableFields={ teachingModesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<TeachingModesList/>}
        create={<TeachingModeCreate/>}
        edit={<TeachingModeEdit/>}
        show={<TeachingModeShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<TeachingModesCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const TeachingModesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Teaching Modes" leftIcon={<ICON />} />
)
