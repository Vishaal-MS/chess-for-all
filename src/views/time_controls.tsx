import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, createReferenceField, createReferenceInput, ChoicesLiveFilter, NumberLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { AccessTime } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, NumberField, NumberInput, SelectField, SelectInput, required} from "react-admin";

export const RESOURCE = "time_controls"
export const ICON = AccessTime
export const PREFETCH: string[] = []

export const TimeControlsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const TimeControlsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const timeControlsActionDefs: ResourceActionDefs = {};

export const nameChoices = [{ id: 'bullet', name: 'Bullet' }, { id: 'blitz', name: 'Blitz' }, { id: 'rapid', name: 'Rapid' }, { id: 'classical', name: 'Classical' }];
export const NameChoiceField = (props: any) => <SelectField {...props} choices={nameChoices} />;

const filters = [
    <TextLiveFilter source="search" show />,
    <ChoicesLiveFilter source="name" label="Name" choiceLabels={nameChoices} show />,
    <NumberLiveFilter source="base_time_number" label="Base Time" />,
    <NumberLiveFilter source="increment_time_number" label="Increment Time" />
]

export const TimeControlsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)}>
                <DataTable.Col source="name" field={NameChoiceField} />
                <DataTable.Col source="base_time_number" field={NumberField}/>
                <DataTable.Col source="increment_time_number" field={NumberField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const TimeControlsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<SelectField source="name" choices={nameChoices} variant='h6' />}>
                <NumberField source="base_time_number" />
                <NumberField source="increment_time_number" />
            </CardGrid>
        </List>
    )
}

const TimeControlForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)}>
            <SelectInput source="name" choices={nameChoices} validate={required()} />
            <NumberInput source="base_time_number" validate={required()} />
            <NumberInput source="increment_time_number" validate={required()} />
            <TextInput source="description" multiline rows={5} validate={required()} />
        </SimpleForm>
    )
}

const TimeControlEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <TimeControlForm />
        </Edit>
    )
}

const TimeControlCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <TimeControlForm />
        </Create>
    )
}

const TimeControlShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout>
                <SelectField source="name" choices={nameChoices} />
                <NumberField source="base_time_number" />
                <NumberField source="increment_time_number" />
                <TextField source="description" />
            </SimpleShowLayout>
        </Show>
    )
}

const timeControlsFieldSchema: FieldSchema = {
    name: { type: 'choice', ui: 'select', required: true, choices: nameChoices },
    base_time_number: { required: true },
    increment_time_number: { required: true },
    description: { ui: 'multiline', required: true }
};
const timeControlsSearchableFields: string[] = [
    'name'
];

export const TimeControlsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        fieldSchema={ timeControlsFieldSchema}
        actionDefs={ timeControlsActionDefs}
        searchableFields={ timeControlsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<TimeControlsList/>}
        create={<TimeControlCreate/>}
        edit={<TimeControlEdit/>}
        show={<TimeControlShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<TimeControlsCardList/>}
        sort={{ field: 'name', order: 'ASC' }}
    />
)
export const TimeControlsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Time Controls" leftIcon={<ICON />} />
)
