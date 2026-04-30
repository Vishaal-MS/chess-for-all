import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, ReferenceLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { School } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required, useUnique} from "react-admin";
import { StandardsReferenceField, StandardsReferenceInput } from './standards.js';

export const RESOURCE = "standard_grades"
export const ICON = School
export const PREFETCH: string[] = ["standards"]

export const StandardGradesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const StandardGradesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const standardGradesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="standard_id" reference="standards" label="Standard" />
]

export const StandardGradesList = (props: ListProps) => {
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

export const StandardGradesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
                <TextField source="code" />
                <StandardsReferenceField source="standard_id" />
            </CardGrid>
        </List>
    )
}

const StandardGradeForm = (props: any) => {
    const unique = useUnique();
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
            <TextInput source="code" validate={unique()} />
            <StandardsReferenceInput source="standard_id" />
        </SimpleForm>
    )
}

const StandardGradeEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <StandardGradeForm />
        </Edit>
    )
}

const StandardGradeCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <StandardGradeForm />
        </Create>
    )
}

const StandardGradeShow = (props: any) => {
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

const standardGradesFieldSchema: FieldSchema = {
    name: { required: true },
    code: { unique: true },
    standard_id: { resource: 'standards' }
};
const standardGradesSearchableFields: string[] = [
    'name',
    'standard.name',
    'code'
];

export const StandardGradesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ standardGradesFieldSchema}
        actionDefs={ standardGradesActionDefs}
        searchableFields={ standardGradesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<StandardGradesList/>}
        create={<StandardGradeCreate/>}
        edit={<StandardGradeEdit/>}
        show={<StandardGradeShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<StandardGradesCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const StandardGradesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Standard Grades" leftIcon={<ICON />} />
)
