import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Label } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput} from "react-admin";

export const RESOURCE = "tags"
export const ICON = Label
export const PREFETCH: string[] = []

export const TagsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const TagsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const tagsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const TagsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const TagsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const TagForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" />
        </SimpleForm>
    )
}

const TagEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <TagForm />
        </Edit>
    )
}

const TagCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <TagForm />
        </Create>
    )
}

const TagShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
        </Show>
    )
}

const tagsFieldSchema: FieldSchema = {
    name: {}
};
const tagsSearchableFields: string[] = [
    'name'
];

export const TagsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ tagsFieldSchema}
        actionDefs={ tagsActionDefs}
        searchableFields={ tagsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<TagsList/>}
        create={<TagCreate/>}
        edit={<TagEdit/>}
        show={<TagShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<TagsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const TagsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Tags" leftIcon={<ICON />} />
)
