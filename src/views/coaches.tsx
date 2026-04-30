import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, ReferenceLiveFilter, ChoicesLiveFilter, NumberLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { SupervisorAccount } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, NumberField, NumberInput, SelectField, SelectInput} from "react-admin";
import { UsersReferenceField, UsersReferenceInput } from './users.js';
import { DivisionsReferenceField, DivisionsReferenceInput } from './divisions.js';

export const RESOURCE = "coaches"
export const ICON = SupervisorAccount
export const PREFETCH: string[] = ["users", "divisions"]

export const CoachesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const CoachesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const coachesActionDefs: ResourceActionDefs = {};

export const genderChoices = [{ id: 'male', name: 'Male' }, { id: 'female', name: 'Female' }];
export const GenderChoiceField = (props: any) => <SelectField {...props} choices={genderChoices} />;

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="user_id" reference="users" label="User" />,
    <NumberLiveFilter source="contact_number" label="Contact" />,
    <ChoicesLiveFilter source="gender" label="Gender" choiceLabels={genderChoices} show />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />
]

export const CoachesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['contact_number', 'gender', 'division_id']} >
                <DataTable.Col source="user_id" field={UsersReferenceField}/>
                <DataTable.Col source="rating" />
                <DataTable.Col source="years_of_experience" />
                <DataTable.Col source="special_skills" />
                <DataTable.Col source="country" />
                <DataTable.Col source="contact_number" field={NumberField}/>
                <DataTable.Col source="gender" field={GenderChoiceField} />
                <DataTable.Col source="division_id" field={DivisionsReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const CoachesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<UsersReferenceField source="user_id" variant='h6' link={false} />}>
                <TextField source="rating" />
                <TextField source="years_of_experience" />
            </CardGrid>
        </List>
    )
}

const CoachForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <UsersReferenceInput source="user_id" />
            <TextInput source="rating" />
            <TextInput source="years_of_experience" />
            <TextInput source="special_skills" />
            <TextInput source="country" />
            <NumberInput source="contact_number" />
            <SelectInput source="gender" choices={genderChoices} />
            <DivisionsReferenceInput source="division_id" />
        </SimpleForm>
    )
}

const CoachEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <CoachForm />
        </Edit>
    )
}

const CoachCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <CoachForm />
        </Create>
    )
}

const CoachShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <UsersReferenceField source="user_id" />
                <TextField source="rating" />
                <TextField source="years_of_experience" />
                <TextField source="special_skills" />
                <TextField source="country" />
                <NumberField source="contact_number" />
                <SelectField source="gender" choices={genderChoices} />
                <DivisionsReferenceField source="division_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const coachesFieldSchema: FieldSchema = {
    user_id: { resource: 'users' },
    rating: {},
    years_of_experience: {},
    special_skills: {},
    country: {},
    contact_number: {},
    gender: { type: 'choice', ui: 'select', choices: genderChoices },
    division_id: { resource: 'divisions' }
};
const coachesSearchableFields: string[] = [
    'rating',
    'years_of_experience',
    'special_skills',
    'country',
    'gender'
];

export const CoachesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('users', record.user)}
        fieldSchema={ coachesFieldSchema}
        actionDefs={ coachesActionDefs}
        searchableFields={ coachesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<CoachesList/>}
        create={<CoachCreate/>}
        edit={<CoachEdit/>}
        show={<CoachShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<CoachesCardList/>}
        hasColumnChooser
        sort={{ field: 'rating', order: 'ASC' }}
    />
)
export const CoachesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Coaches" leftIcon={<ICON />} />
)
