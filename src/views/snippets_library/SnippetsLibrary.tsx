import {
    AutocompleteArrayInput,
    BooleanField,
    BooleanInput, Create,
    Datagrid, Edit, List,
    NumberField, NumberInput, ReferenceArrayField, ReferenceArrayInput, SearchInput, SelectInput, Show,
    SimpleForm,
    SimpleShowLayout, SingleFieldList,
    TextField,
    TextInput,
} from "react-admin";
import {PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {Grid} from "@mui/material";

export const SnippetsLibraryList = () => {
    const choices = [{id: true, name: 'Yes'}, {id: false, name: 'No'}];
    const filters = [
        <SearchInput source="q" alwaysOn/>,
        <SelectInput source="type" choices={getTypeChoices()} alwaysOn/>,
        <SelectInput label="Active?" source={"is_active"} choices={choices} alwaysOn/>,
        <SelectInput label="Advanced?" source={"is_advanced"} choices={choices} alwaysOn/>,
        <ReferenceArrayInput source="tag_ids" reference="tags" alwaysOn queryOptions={{meta: {scopingEscapeHatch:true}}} perPage={1000} sort={{ field: 'name', order: 'ASC' }}>
            <AutocompleteArrayInput label="Tags" />
        </ReferenceArrayInput>
    ];

    return (
        <List pagination={<SensibleDefaultPagination/>} disableSyncWithLocation perPage={PER_PAGE}
              resource="snippets_library" filters={filters} exporter={false} sort={{field: 'position_number', order: "ASC"}}
              queryOptions={{meta: {scopingEscapeHatch: true}}}>
            <Datagrid bulkActionButtons={false}>
                <TextField source="title"/>
                <TextField source="type"/>
                <ReferenceArrayField source="tag_ids" reference="tags" label="Tags" perPage={1000}>
                    <SingleFieldList linkType={false} />
                </ReferenceArrayField>
                <NumberField source="position_number"/>
                <BooleanField label="Active?" source="is_active"/>
                <BooleanField label="Advanced?" source="is_advanced"/>
            </Datagrid>
        </List>
    );
}

export const SnippetsLibraryShow = () => (
    <Show resource="snippets_library">
        <SimpleShowLayout>
            <TextField source="title"/>
            <TextField source="type"/>
            <NumberField source="position_number"/>
            <BooleanField label="Active?" source="is_active"/>
            <BooleanField label="Advanced?" source="is_advanced"/>
            <TextField source="content"/>
        </SimpleShowLayout>
    </Show>
);

export const SnippetsLibraryCreate = () => (
    <Create>
        <CreateAndEditForm />
    </Create>
);

export const SnippetsLibraryEdit = () => (
    <Edit redirect={"show"} mutationMode="pessimistic">
        <CreateAndEditForm />
    </Edit>
);

const CreateAndEditForm = (props) => {
    return (
        <SimpleForm {...props} resource="snippets_library">
            <TextInput source="title"/>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <SelectInput source="type" choices={getTypeChoices()} label="Type"/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <NumberInput source="position_number"/>
                </Grid>
            </Grid>
            <ReferenceArrayInput source="tag_ids" reference="tags" sort={{field: 'name', order: 'ASC'}}
                                 queryOptions={{meta: {scopingEscapeHatch: true}}} perPage={1000}>
                <AutocompleteArrayInput label="Tags"/>
            </ReferenceArrayInput>
            <BooleanInput label="Active?" source="is_active"/>
            <BooleanInput label="Advanced?" source="is_advanced"/>
            <TextInput source="content" multiline minRows={5} maxRows={10}/>
        </SimpleForm>
    );
}

export const getTypeChoices = () => {
    return [
        {id: 'Animated Tutorial', name: 'Animated Tutorial'},
        {id: 'Guided Exercise', name: 'Guided Exercise'},
        {id: 'Exercise', name: 'Exercise'},
        {id: 'Mcq', name: 'Mcq'},
        {id: 'Pgn', name: 'Pgn'}
    ];
};