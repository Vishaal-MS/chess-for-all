import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, NumberLiveFilter, TextLiveFilter,
    closeDialog} from '@mahaswami/vc-frontend';
import { School } from '@mui/icons-material';
import {
    Create,
    Edit,
    List,
    Menu,
    Show,
    type ListProps,
    TextField,
    TextInput,
    BooleanField,
    BooleanInput,
    NumberField,
    NumberInput,
    SelectInput,
    useNotify,
    useRedirect
} from "react-admin";
import { UsersReferenceField, UsersReferenceInput } from './users.js';
import { ClientsReferenceField, ClientsReferenceInput } from './clients.js';
import { DivisionsReferenceField, DivisionsReferenceInput } from './divisions.js';
import { StandardGradesReferenceField, StandardGradesReferenceInput } from './standard_grades.js';
import { ClientTypes, UserStatus, EPOCHE_ZERO_DATE, studentStatusChoices } from "../helpers/constants.ts";
import {getStandardId, isRegularSchoolFlavored} from "../businessLogic.ts";
import {ExtendedStudentFields} from "./students/extendedStudentFields.tsx";

export const RESOURCE = "students"
export const ICON = School
export const PREFETCH: string[] = ["users", "clients", "parent_users", "divisions", "standard_grades"]

export const StudentsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const StudentsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const studentsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="user_id" reference="users" label="User" />,
    <ReferenceLiveFilter source="client_id" reference="clients" label="Client" />,
    <ReferenceLiveFilter source="parent_user_id" reference="parent_users" label="Parent User" />,
    <NumberLiveFilter source="phone_number" label="Phone" />,
    <BooleanLiveFilter source="is_integrated_parental_engagement" label="Integrated Parental Engagement" />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />,
    <ReferenceLiveFilter source="standard_grade_id" reference="standard_grades" label="Standard Grade" />
]

export const StudentsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['parent_user_id', 'emergency_contact', 'grade', 'phone_number', 'method_of_going_home', 'is_integrated_parental_engagement', 'division_id', 'standard_grade_id']} >
                <DataTable.Col source="user_id" field={UsersReferenceField}/>
                <DataTable.Col source="client_id" field={ClientsReferenceField}/>
                <DataTable.Col source="gender" />
                <DataTable.Col source="date_of_birth" />
                <DataTable.Col source="country" />
                <DataTable.Col source="parent_user_id" field={UsersReferenceField}/>
                <DataTable.Col source="emergency_contact" />
                <DataTable.Col source="grade" />
                <DataTable.Col source="phone_number" field={NumberField}/>
                <DataTable.Col source="method_of_going_home" />
                <DataTable.Col source="is_integrated_parental_engagement" field={BooleanField}/>
                <DataTable.Col source="division_id" field={DivisionsReferenceField}/>
                <DataTable.Col source="standard_grade_id" field={StandardGradesReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const StudentsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<UsersReferenceField source="user_id" variant='h6' link={false} />}>
                <ClientsReferenceField source="client_id" />
                <TextField source="gender" />
            </CardGrid>
        </List>
    )
}

export const StudentStatusSelect = ({user = {}, type}) => {
    const status = user?.status;
    const choices = studentStatusChoices.filter((choice:any) => {
        if(status === UserStatus.ACTIVE){
            return  choice.name !== UserStatus.PENDING
        } else if (status === UserStatus.PENDING) {
            return choice.name !== UserStatus.ACTIVE
        } else if( user.last_login_date && user.last_login_date === EPOCHE_ZERO_DATE) {
            return choice.name !== UserStatus.ACTIVE
        } else {
            return  choice.name !== UserStatus.PENDING
        }
    })
    const source = type === ClientTypes.INDIVIDUAL ? 'student.user.status' : 'user.status';
    return <SelectInput source={source} choices={choices} label="Status" />
}

const StudentForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <UsersReferenceInput source="user_id" />
            <ClientsReferenceInput source="client_id" />
            <TextInput source="gender" />
            <TextInput source="date_of_birth" />
            <TextInput source="country" />
            <UsersReferenceInput source="parent_user_id" />
            <TextInput source="emergency_contact" />
            <TextInput source="grade" />
            <NumberInput source="phone_number" />
            <TextInput source="method_of_going_home" />
            <BooleanInput source="is_integrated_parental_engagement" />
            <DivisionsReferenceInput source="division_id" />
            <StandardGradesReferenceInput source="standard_grade_id" />
        </SimpleForm>
    )
}

const StudentEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <StudentForm />
        </Edit>
    )
}

const StudentCreate = (props: any) => {
    const notify = useNotify();
    const redirect = useRedirect();
    const client = props.client;
    const clientId = client?.id || null;
    const  standardId = isRegularSchoolFlavored() ? getStandardId() : client.standard_id || null;

    const onSuccess = async (data: any) => {
        notify('Student added successfully', {type: 'success'});
        closeDialog();
        if(isRegularSchoolFlavored()) {
            redirect('/clients')
        } else {
            redirect(`/clients/${data.client_id}/1`);
        }
    }

    return (
    	<Create {...createDefaults(props)}>
            <SimpleForm defaultValues={{client_id: clientId}}>
                <ExtendedStudentFields mode={'create'} standardId={standardId}/>
            </SimpleForm>
        </Create>
    )
}

const StudentShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <UsersReferenceField source="user_id" />
                <ClientsReferenceField source="client_id" />
                <TextField source="gender" />
                <TextField source="date_of_birth" />
                <TextField source="country" />
                <UsersReferenceField source="parent_user_id" />
                <TextField source="emergency_contact" />
                <TextField source="grade" />
                <NumberField source="phone_number" />
                <TextField source="method_of_going_home" />
                <BooleanField source="is_integrated_parental_engagement" />
                <DivisionsReferenceField source="division_id" />
                <StandardGradesReferenceField source="standard_grade_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const studentsFieldSchema: FieldSchema = {
    user_id: { resource: 'users' },
    client_id: { resource: 'clients' },
    gender: {},
    date_of_birth: {},
    country: {},
    parent_user_id: { resource: 'parent_users' },
    emergency_contact: {},
    grade: {},
    phone_number: {},
    method_of_going_home: {},
    is_integrated_parental_engagement: {},
    division_id: { resource: 'divisions' },
    standard_grade_id: { resource: 'standard_grades' }
};
const studentsSearchableFields: string[] = [
    'gender',
    'date_of_birth',
    'country',
    'emergency_contact',
    'grade',
    'method_of_going_home'
];

export const StudentsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('users', record.user)}
        fieldSchema={ studentsFieldSchema}
        actionDefs={ studentsActionDefs}
        searchableFields={ studentsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<StudentsList/>}
        create={<StudentCreate/>}
        edit={<StudentEdit/>}
        show={<StudentShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<StudentsCardList/>}
        hasColumnChooser
        sort={{ field: 'gender', order: 'ASC' }}
    />
)
export const StudentsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Students" leftIcon={<ICON />} />
)
