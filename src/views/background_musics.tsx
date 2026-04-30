import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, SimpleFileField, SimpleFileInput, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Category } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput} from "react-admin";

export const RESOURCE = "background_musics"
export const ICON = Category
export const PREFETCH: string[] = []

export const BackgroundMusicsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const BackgroundMusicsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const backgroundMusicsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

export const BackgroundMusicsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const BackgroundMusicsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
            </CardGrid>
        </List>
    )
}

const BackgroundMusicForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" />
            <SimpleFileInput source="music_attachment_file_id" />
            <SimpleFileField source="music_attachment_file_id" title="music_attachment_file_name" />
        </SimpleForm>
    )
}

const BackgroundMusicEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <BackgroundMusicForm />
        </Edit>
    )
}

const BackgroundMusicCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <BackgroundMusicForm />
        </Create>
    )
}

const BackgroundMusicShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
                <SimpleFileField source="music_attachment_file_id" title="music_attachment_file_name" />
            </SimpleShowLayout>
        </Show>
    )
}

const backgroundMusicsFieldSchema: FieldSchema = {
    name: {},
    music_attachment_file_id: {}
};
const backgroundMusicsSearchableFields: string[] = [
    'name'
];

export const BackgroundMusicsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ backgroundMusicsFieldSchema}
        actionDefs={ backgroundMusicsActionDefs}
        searchableFields={ backgroundMusicsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<BackgroundMusicsList/>}
        create={<BackgroundMusicCreate/>}
        edit={<BackgroundMusicEdit/>}
        show={<BackgroundMusicShow/>}
        hasDialog
        hasLiveUpdate
        cardList={<BackgroundMusicsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const BackgroundMusicsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Background Musics" leftIcon={<ICON />} />
)
