import { Resource, createDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Description } from '@mui/icons-material';
import {
    Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, required, TabbedForm, useGetRecordId
} from "react-admin";
import {StandardList} from "./standards/StandardList.tsx";
import { CategoryList } from './categories/Categories.tsx';
import {GradeList} from "./grade/Grades.tsx";
import {SectionList} from "./standard_sections.tsx";

export const RESOURCE = "standards"
export const ICON = Description
export const PREFETCH: string[] = []

export const StandardsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const StandardsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const standardsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />
]

const StandardForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
        </SimpleForm>
    )
}

const StandardEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <StandardForm />
        </Edit>
    )
}

const StandardCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <StandardForm />
        </Create>
    )
}

const StandardShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
            </SimpleShowLayout>
            <StandardTabs />
        </Show>
    )
}

export const StandardTabs = () => {
    const standardId = Number(useGetRecordId());

    return (
        <TabbedForm toolbar={false}>
            <TabbedForm.Tab label="grades">
                <GradeList standardId={standardId}/>
            </TabbedForm.Tab>
            <TabbedForm.Tab label="categories">
                <CategoryList standardId={standardId} />
            </TabbedForm.Tab>
            <TabbedForm.Tab label="sections">
                <SectionList standardId={standardId} />
            </TabbedForm.Tab>
        </TabbedForm>
    );
}

const standardsFieldSchema: FieldSchema = {
    name: { required: true }
};
const standardsSearchableFields: string[] = [
    'name'
];

export const StandardsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ standardsFieldSchema}
        actionDefs={ standardsActionDefs}
        searchableFields={ standardsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<StandardList/>}
        create={<StandardCreate/>}
        edit={<StandardEdit/>}
        show={<StandardShow/>}
        hasLiveUpdate
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const StandardsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Standards" leftIcon={<ICON />} />
)
