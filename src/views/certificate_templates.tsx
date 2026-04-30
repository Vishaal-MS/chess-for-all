import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, BooleanLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Assignment } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput, required} from "react-admin";

export const RESOURCE = "certificate_templates"
export const ICON = Assignment
export const PREFETCH: string[] = []

export const CertificateTemplatesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const CertificateTemplatesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const certificateTemplatesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <BooleanLiveFilter source="is_active" label="Active" />,
    <DateLiveFilter source="created_date" label="Created" />
]

export const CertificateTemplatesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" />
                <DataTable.Col source="is_active" field={BooleanField}/>
                <DataTable.Col source="created_date" field={DateField}/>
                <DataTable.Col source="attachment_file_id" />
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const CertificateTemplatesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" variant='h6' />}>
                <BooleanField source="is_active" />
                <DateField source="created_date" />
            </CardGrid>
        </List>
    )
}

const CertificateTemplateForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <TextInput source="name" validate={required()} />
            <BooleanInput source="is_active" />
            <DateInput source="created_date" />
            <TextInput source="attachment_file_id" />
        </SimpleForm>
    )
}

const CertificateTemplateEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <CertificateTemplateForm />
        </Edit>
    )
}

const CertificateTemplateCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <CertificateTemplateForm />
        </Create>
    )
}

const CertificateTemplateShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <TextField source="name" />
                <BooleanField source="is_active" />
                <DateField source="created_date" />
                <TextField source="attachment_file_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const certificateTemplatesFieldSchema: FieldSchema = {
    name: { required: true },
    is_active: {},
    created_date: {},
    attachment_file_id: {}
};
const certificateTemplatesSearchableFields: string[] = [
    'name'
];

export const CertificateTemplatesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ certificateTemplatesFieldSchema}
        actionDefs={ certificateTemplatesActionDefs}
        searchableFields={ certificateTemplatesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<CertificateTemplatesList/>}
        create={<CertificateTemplateCreate/>}
        edit={<CertificateTemplateEdit/>}
        show={<CertificateTemplateShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<CertificateTemplatesCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const CertificateTemplatesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Certificate Templates" leftIcon={<ICON />} />
)
