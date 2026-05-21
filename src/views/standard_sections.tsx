import {
    Resource,
    formDefaults,
    showDefaults,
    DataTable,
    SimpleShowLayout,
    SimpleForm,
    type ResourceActionDefs,
    type FieldSchema,
    createReferenceField,
    createReferenceInput,
    ReferenceLiveFilter,
    TextLiveFilter,
    openDialog
} from '@mahaswami/vc-frontend';
import { Class } from '@mui/icons-material';
import {
    Create, Edit, List, Menu, Show, TextField, TextInput, useUnique, AutocompleteInput, TopToolbar, Button
} from "react-admin";
import { StandardGradesReferenceField, StandardGradesReferenceInput } from './standard_grades.js';
import { StandardCategoriesReferenceField, StandardCategoriesReferenceInput } from './standard_categories.js';
import { StandardsReferenceField } from './standards.js';
import {isSuperAdmin} from "../businessLogic.ts";
import AddIcon from "@mui/icons-material/Add";

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

export const SectionList = ({standardId}) => {
    const superAdmin = isSuperAdmin();
    const CreateSectionToolBar = () => {
        const createSectionDialog = () => (
            openDialog(<SectionCreate standardId={standardId} width="70vw"/>)
        )
        return (
            <TopToolbar>
                <Button startIcon={<AddIcon />} label={"Create Section"} onClick={createSectionDialog}/>
            </TopToolbar>
        )
    }
    const showSectionDialog = (id) => (
        openDialog(<SectionEdit sectionId={id} width="70vw"/>)
    );

    return(
        <List resource="standard_sections" filters={filters} title={false} filter={{standard_id: standardId}}
              exporter={false} actions={superAdmin ? <CreateSectionToolBar /> : false} sx={{width: '100%'}}
              disableSyncWithLocation>
            <DataTable rowClick={superAdmin ? showSectionDialog : false} bulkActionButtons={false}>
                <DataTable.Col source="code"/>
                <DataTable.Col source="content_type" label={"Content Type"}/>
                <DataTable.Col source="standard_category_id" label={"Category"} field={StandardCategoriesReferenceField} />
                <DataTable.Col source="standard_grade_id" label={"Grade"} field={StandardGradesReferenceField} />
            </DataTable>
        </List>
    )
}

const SectionForm = (props: any) => {
    const unique = useUnique();
    const { standardId } = props;
    return (
        <SimpleForm {...formDefaults(props)} defaultValues={standardId ? {standard_id: standardId} : {}}
                    display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <TextInput source="code" validate={unique()} />
            <TextInput source="content_type" />
            <TextInput source="item" />
            <StandardGradesReferenceInput source="standard_grade_id" filter={{ standard_id: standardId }}>
                <AutocompleteInput optionText="name" />
            </StandardGradesReferenceInput>
            <StandardCategoriesReferenceInput source="standard_category_id" filter={{standard_id: standardId}}>
                <AutocompleteInput optionText="name" />
            </StandardCategoriesReferenceInput>
            <TextInput source="description" multiline rows={5} />
        </SimpleForm>
    )
}

const SectionEdit = (sectionId: any) => {
    return (
        <Edit resource="standard_sections" title={false} id={sectionId} redirect={false}  mutationMode='pessimistic'>
            <SectionForm />
        </Edit>
    )
}

export const SectionCreate = ({ props }: any) => {

    return (
        <Create resource="standard_sections" redirect={false} title={false}>
            <SectionForm { ...props }/>
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
        list={<SectionList/>}
        create={<SectionCreate/>}
        edit={<SectionEdit/>}
        show={<StandardSectionShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'standard_grade.name', order: 'ASC' }}
    />
)
export const StandardSectionsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Standard Sections" leftIcon={<ICON />} />
)
