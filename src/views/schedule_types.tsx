import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { CalendarMonth } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required} from "react-admin";

export const RESOURCE = "schedule_types"
export const ICON = CalendarMonth
export const PREFETCH: string[] = []

export const ScheduleTypesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ScheduleTypesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const scheduleTypesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const ScheduleTypesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const ScheduleTypesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const ScheduleTypeForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
        </SimpleForm>
    )
}

const ScheduleTypeEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <ScheduleTypeForm />
        </Edit>
    )
}

const ScheduleTypeCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <ScheduleTypeForm />
        </Create>
    )
}

const ScheduleTypeShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const scheduleTypesFieldSchema: FieldSchema = {
    name: { required: true }
};
const scheduleTypesSearchableFields: string[] = [
    'name'
];

export const ScheduleTypesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ scheduleTypesFieldSchema}
        actionDefs={ scheduleTypesActionDefs}
        searchableFields={ scheduleTypesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ScheduleTypesList/>}
        create={<ScheduleTypeCreate/>}
        edit={<ScheduleTypeEdit/>}
        show={<ScheduleTypeShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<ScheduleTypesCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const ScheduleTypesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Schedule Types" leftIcon={<ICON />} />
)
