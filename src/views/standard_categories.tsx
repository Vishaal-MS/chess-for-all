import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, ReferenceLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Category } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required, useUnique} from "react-admin";
import { StandardsReferenceField, StandardsReferenceInput } from './standards.js';

export const RESOURCE = "standard_categories"
export const ICON = Category
export const PREFETCH: string[] = ["standards"]

export const StandardCategoriesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const StandardCategoriesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const standardCategoriesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="standard_id" reference="standards" label="Standard" />
]

export const StandardCategoriesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <DataTable.Col source="code" />
                <DataTable.Col source="standard_id" field={StandardsReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const StandardCategoriesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
                <TextField source="code" />
                <StandardsReferenceField source="standard_id" />
            </CardGrid>
        </List>
    )
}

const StandardCategoryForm = (props: any) => {
    const unique = useUnique();
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
            <TextInput source="code" validate={unique()} />
            <StandardsReferenceInput source="standard_id" />
        </SimpleForm>
    )
}

const StandardCategoryEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <StandardCategoryForm />
        </Edit>
    )
}

const StandardCategoryCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <StandardCategoryForm />
        </Create>
    )
}

const StandardCategoryShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
                <TextField source="code" />
                <StandardsReferenceField source="standard_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const standardCategoriesFieldSchema: FieldSchema = {
    name: { required: true },
    code: { unique: true },
    standard_id: { resource: 'standards' }
};
const standardCategoriesSearchableFields: string[] = [
    'name',
    'standard.name',
    'code'
];

export const StandardCategoriesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ standardCategoriesFieldSchema}
        actionDefs={ standardCategoriesActionDefs}
        searchableFields={ standardCategoriesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<StandardCategoriesList/>}
        create={<StandardCategoryCreate/>}
        edit={<StandardCategoryEdit/>}
        show={<StandardCategoryShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<StandardCategoriesCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const StandardCategoriesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Standard Categories" leftIcon={<ICON />} />
)
