import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Schedule } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput} from "react-admin";
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';
import { ScheduleTypesReferenceField, ScheduleTypesReferenceInput } from './schedule_types.js';

export const RESOURCE = "class_schedules"
export const ICON = Schedule
export const PREFETCH: string[] = ["classes", "schedule_types"]

export const ClassSchedulesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ClassSchedulesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const classSchedulesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <ReferenceLiveFilter source="schedule_type_id" reference="schedule_types" label="Schedule Type" />,
    <DateLiveFilter source="start_date" label="Start" />,
    <DateLiveFilter source="end_date" label="End" />,
    <BooleanLiveFilter source="is_google_calendar_enabled" label="Google Calendar Enabled" />
]

export const ClassSchedulesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['start_datetime', 'time_of_start', 'end_datetime', 'time_of_end', 'timezone', 'details', 'calendar_links', 'google_calendar_id_value', 'is_google_calendar_enabled']} >
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="schedule_type_id" field={ScheduleTypesReferenceField}/>
                <DataTable.Col source="days" />
                <DataTable.Col source="start_date" field={DateField}/>
                <DataTable.Col source="end_date" field={DateField}/>
                <DataTable.Col source="start_datetime" />
                <DataTable.Col source="time_of_start" />
                <DataTable.Col source="end_datetime" />
                <DataTable.Col source="time_of_end" />
                <DataTable.Col source="timezone" />
                <DataTable.Col source="details" />
                <DataTable.Col source="calendar_links" />
                <DataTable.Col source="google_calendar_id_value" />
                <DataTable.Col source="is_google_calendar_enabled" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const ClassSchedulesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<ClassesReferenceField source="class_id" variant='h6' link={false} />}>
                <ScheduleTypesReferenceField source="schedule_type_id" />
                <TextField source="days" />
            </CardGrid>
        </List>
    )
}

const ClassScheduleForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <ClassesReferenceInput source="class_id" />
            <ScheduleTypesReferenceInput source="schedule_type_id" />
            <TextInput source="days" />
            <DateInput source="start_date" />
            <DateInput source="end_date" />
            <TextInput source="start_datetime" />
            <TextInput source="time_of_start" />
            <TextInput source="end_datetime" />
            <TextInput source="time_of_end" />
            <TextInput source="timezone" />
            <TextInput source="details" />
            <TextInput source="calendar_links" />
            <TextInput source="google_calendar_id_value" />
            <BooleanInput source="is_google_calendar_enabled" />
        </SimpleForm>
    )
}

const ClassScheduleEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <ClassScheduleForm />
        </Edit>
    )
}

const ClassScheduleCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <ClassScheduleForm />
        </Create>
    )
}

const ClassScheduleShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <ClassesReferenceField source="class_id" />
                <ScheduleTypesReferenceField source="schedule_type_id" />
                <TextField source="days" />
                <DateField source="start_date" />
                <DateField source="end_date" />
                <TextField source="start_datetime" />
                <TextField source="time_of_start" />
                <TextField source="end_datetime" />
                <TextField source="time_of_end" />
                <TextField source="timezone" />
                <TextField source="details" />
                <TextField source="calendar_links" />
                <TextField source="google_calendar_id_value" />
                <BooleanField source="is_google_calendar_enabled" />
            </SimpleShowLayout>
        </Show>
    )
}

const classSchedulesFieldSchema: FieldSchema = {
    class_id: { resource: 'classes' },
    schedule_type_id: { resource: 'schedule_types' },
    days: {},
    start_date: {},
    end_date: {},
    start_datetime: {},
    time_of_start: {},
    end_datetime: {},
    time_of_end: {},
    timezone: {},
    details: {},
    calendar_links: {},
    google_calendar_id_value: {},
    is_google_calendar_enabled: {}
};
const classSchedulesSearchableFields: string[] = [
    'days',
    'start_datetime',
    'time_of_start',
    'end_datetime',
    'time_of_end',
    'timezone',
    'details',
    'calendar_links',
    'google_calendar_id_value'
];

export const ClassSchedulesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('classes', record.class)}
        fieldSchema={ classSchedulesFieldSchema}
        actionDefs={ classSchedulesActionDefs}
        searchableFields={ classSchedulesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ClassSchedulesList/>}
        create={<ClassScheduleCreate/>}
        edit={<ClassScheduleEdit/>}
        show={<ClassScheduleShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<ClassSchedulesCardList/>}
        hasColumnChooser
        sort={{ field: 'days', order: 'ASC' }}
    />
)
export const ClassSchedulesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Class Schedules" leftIcon={<ICON />} />
)
