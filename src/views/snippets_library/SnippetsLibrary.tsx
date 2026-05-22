import { AutocompleteArrayInput, BooleanField, BooleanInput, Create, Edit, List,
    NumberField, NumberInput, ReferenceArrayField, ReferenceArrayInput, SelectInput, Show,
    SimpleShowLayout, SingleFieldList, TextField, TextInput,
} from "react-admin";
import {
    DataTable,
    editDefaults,
    listDefaults,
    showDefaults,
    SimpleForm, tableDefaults
} from "@mahaswami/vc-frontend";
import {Grid} from "@mui/material";
import {RESOURCE} from "../snippets_libraries.tsx";

export const SnippetsLibraryList = (props: any) => {
    return (
        <List { ...listDefaults(props)} disableSyncWithLocation exporter={false}
              sort={{ field: 'position_number', order: "ASC" }} queryOptions={{ meta: {scopingEscapeHatch: true }}}>
            <DataTable { ...tableDefaults(RESOURCE)} bulkActionButtons={false}>
                <DataTable.Col source="title"/>
                <DataTable.Col source="type"/>
                <DataTable.Col label="Tags" field={() =>
                    <ReferenceArrayField source="tag_ids" reference="tags" perPage={1000}>
                        <SingleFieldList linkType={false} />
                    </ReferenceArrayField>} />
                <DataTable.Col source="position_number" field={NumberField}/>
                <DataTable.Col label="Active?" source="is_active" field={BooleanField}/>
                <DataTable.Col label="Advanced?" source="is_advanced" field={BooleanField}/>
            </DataTable>
        </List>
    );
}

export const SnippetsLibraryShow = (props) => (
    <Show { ...showDefaults(props)} resource="snippets_library">
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

export const SnippetsLibraryEdit = (props) => (
    <Edit {...editDefaults(props)} redirect={"show"} mutationMode="pessimistic">
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