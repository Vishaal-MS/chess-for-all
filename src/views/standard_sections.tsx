import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, ReferenceLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Class } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, useUnique} from "react-admin";
import { StandardGradesReferenceField, StandardGradesReferenceInput } from './standard_grades.js';
import { StandardCategoriesReferenceField, StandardCategoriesReferenceInput } from './standard_categories.js';
import { StandardsReferenceField, StandardsReferenceInput } from './standards.js';

export const RESOURCE = "standard_sections"
export const ICON = Class
export const PREFETCH: string[] = ["standard_grades", "standard_categories", "standards"]

export const StandardSectionsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const StandardSectionsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const standardSectionsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="standard_grade_id" reference="standard_grades" label="Standard Grade" />,
    <ReferenceLiveFilter source="standard_category_id" reference="standard_categories" label="Standard Category" />,
    <ReferenceLiveFilter source="standard_id" reference="standards" label="Standard" />
]

export const StandardSectionsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['standard_id']} >
                <DataTable.Col source="code" />
                <DataTable.Col source="content_type" />
                <DataTable.Col source="item" />
                <DataTable.Col source="standard_grade_id" field={StandardGradesReferenceField}/>
                <DataTable.Col source="standard_category_id" field={StandardCategoriesReferenceField}/>
                <DataTable.Col source="standard_id" field={StandardsReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const StandardSectionsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="code" variant='h6' />}>
                <TextField source="content_type" />
                <TextField source="item" />
            </CardGrid>
        </List>
    )
}

const StandardSectionForm = (props: any) => {
    const unique = useUnique();
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <TextInput source="code" validate={unique()} />
            <TextInput source="content_type" />
            <TextInput source="item" />
            <TextInput source="description" multiline rows={5} />
            <StandardGradesReferenceInput source="standard_grade_id" />
            <StandardCategoriesReferenceInput source="standard_category_id" />
            <StandardsReferenceInput source="standard_id" />
        </SimpleForm>
    )
}

const StandardSectionEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <StandardSectionForm />
        </Edit>
    )
}

const StandardSectionCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <StandardSectionForm />
        </Create>
    )
}

const StandardSectionShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <TextField source="code" />
                <TextField source="content_type" />
                <TextField source="item" />
                <TextField source="description" />
                <StandardGradesReferenceField source="standard_grade_id" />
                <StandardCategoriesReferenceField source="standard_category_id" />
                <StandardsReferenceField source="standard_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const standardSectionsFieldSchema: FieldSchema = {
    code: { unique: true },
    content_type: {},
    item: {},
    description: { ui: 'multiline' },
    standard_grade_id: { resource: 'standard_grades' },
    standard_category_id: { resource: 'standard_categories' },
    standard_id: { resource: 'standards' }
};
const standardSectionsSearchableFields: string[] = [
    'standard_grade.name',
    'standard_grade.standard.name',
    'standard_category.name',
    'standard_category.standard.name',
    'standard.name',
    'code',
    'content_type',
    'item'
];

export const StandardSectionsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => record.code}
        fieldSchema={ standardSectionsFieldSchema}
        actionDefs={ standardSectionsActionDefs}
        searchableFields={ standardSectionsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<StandardSectionsList/>}
        create={<StandardSectionCreate/>}
        edit={<StandardSectionEdit/>}
        show={<StandardSectionShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<StandardSectionsCardList/>}
        hasColumnChooser
        sort={{ field: 'standard_grade.name', order: 'ASC' }}
    />
)
export const StandardSectionsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Standard Sections" leftIcon={<ICON />} />
)
