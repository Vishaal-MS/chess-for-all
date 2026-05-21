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
    createReferenceField,
    createReferenceInput,
    TextLiveFilter,
    useRealtimeComms
} from '@mahaswami/vc-frontend';
import { Business } from '@mui/icons-material';
import {
    Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, useRedirect
} from "react-admin";

export const RESOURCE = "divisions"
export const ICON = Business
export const PREFETCH: string[] = []

export const DivisionsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const DivisionsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const divisionsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const DivisionsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

const DivisionEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <SimpleForm {...formDefaults(props)}>
                <TextInput source="name" />
            </SimpleForm>
        </Edit>
    )
}

const DivisionCreate = (props: any) => {
    const realtimeComms = useRealtimeComms();
    const redirect = useRedirect();
    const onSuccess = () => {
        realtimeComms.publish(("divisions_updated"), { action: "new" });
        redirect("/divisions");
    }
    return (
        <Create {...createDefaults(props)} mutationOptions={{onSuccess}}>
            <SimpleForm {...formDefaults(props)}>
                <TextInput source="name"/>
            </SimpleForm>
        </Create>
    )
}

const DivisionShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const divisionsFieldSchema: FieldSchema = {
    name: {}
};
const divisionsSearchableFields: string[] = [
    'name'
];

export const DivisionsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ divisionsFieldSchema}
        actionDefs={ divisionsActionDefs}
        searchableFields={ divisionsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<DivisionsList/>}
        create={<DivisionCreate/>}
        edit={<DivisionEdit/>}
        show={<DivisionShow/>}
        hasDialog
        hasLiveUpdate
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const DivisionsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Divisions" leftIcon={<ICON />} />
)
