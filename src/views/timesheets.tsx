import { Resource, createDefaults, tableDefaults,
	editDefaults, formDefaults, listDefaults,
	showDefaults, RowActions, DataTable, SimpleShowLayout, SimpleForm,
	type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField, createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { AccessTime } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput} from "react-admin";
import { CoachesReferenceField, CoachesReferenceInput } from './coaches.js';
import { ClassesReferenceField, ClassesReferenceInput } from './classes.js';
import { DivisionsReferenceField, DivisionsReferenceInput } from './divisions.js';
import {UsersReferenceField, UsersReferenceInput} from "./users.tsx";

export const RESOURCE = "timesheets"
export const ICON = AccessTime
export const PREFETCH: string[] = ["coaches", "classes", "created_by_users", "divisions"]

export const TimesheetsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const TimesheetsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const timesheetsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="coach_id" reference="coaches" label="Coach" />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <DateLiveFilter source="timesheet_date" label="Timesheet" />,
    <BooleanLiveFilter source="is_archived" label="Archived" />,
    <ReferenceLiveFilter source="created_by_user_id" reference="created_by_users" label="Created By User" />,
    <DateLiveFilter source="created_date" label="Created" />,
    <ReferenceLiveFilter source="division_id" reference="divisions" label="Division" />
]

export const TimesheetsList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['is_archived', 'created_by_user_id', 'created_date', 'division_id']} >
                <DataTable.Col source="coach_id" field={CoachesReferenceField}/>
                <DataTable.Col source="class_id" field={ClassesReferenceField}/>
                <DataTable.Col source="timesheet_date" field={DateField}/>
                <DataTable.Col source="hours" />
                <DataTable.Col source="description" />
                <DataTable.Col source="is_archived" field={BooleanField}/>
                <DataTable.Col source="created_by_user_id" field={UsersReferenceField}/>
                <DataTable.Col source="created_date" field={DateField}/>
                <DataTable.Col source="division_id" field={DivisionsReferenceField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const TimesheetsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<CoachesReferenceField source="coach_id" variant='h6' link={false} />}>
                <ClassesReferenceField source="class_id" />
                <DateField source="timesheet_date" />
            </CardGrid>
        </List>
    )
}

const TimesheetForm = (props: any) => {
    return (
        <SimpleForm {...formDefaults(props)} display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
            <CoachesReferenceInput source="coach_id" />
            <ClassesReferenceInput source="class_id" />
            <DateInput source="timesheet_date" />
            <TextInput source="hours" />
            <TextInput source="description" />
            <BooleanInput source="is_archived" />
            <UsersReferenceInput source="created_by_user_id" />
            <DateInput source="created_date" />
            <DivisionsReferenceInput source="division_id" />
        </SimpleForm>
    )
}

const TimesheetEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <TimesheetForm />
        </Edit>
    )
}

const TimesheetCreate = (props: any) => {
    return (
    	<Create {...createDefaults(props)}>
            <TimesheetForm />
        </Create>
    )
}

const TimesheetShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <SimpleShowLayout display="grid"  gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}  gap="1rem" >
                <CoachesReferenceField source="coach_id" />
                <ClassesReferenceField source="class_id" />
                <DateField source="timesheet_date" />
                <TextField source="hours" />
                <TextField source="description" />
                <BooleanField source="is_archived" />
                <UsersReferenceField source="created_by_user_id" />
                <DateField source="created_date" />
                <DivisionsReferenceField source="division_id" />
            </SimpleShowLayout>
        </Show>
    )
}

const timesheetsFieldSchema: FieldSchema = {
    coach_id: { resource: 'coaches' },
    class_id: { resource: 'classes' },
    timesheet_date: {},
    hours: {},
    description: {},
    is_archived: {},
    created_by_user_id: { resource: 'created_by_users' },
    created_date: {},
    division_id: { resource: 'divisions' }
};
const timesheetsSearchableFields: string[] = [
    'hours',
    'description'
];

export const TimesheetsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('coaches', record.coach)}
        fieldSchema={ timesheetsFieldSchema}
        actionDefs={ timesheetsActionDefs}
        searchableFields={ timesheetsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<TimesheetsList/>}
        create={<TimesheetCreate/>}
        edit={<TimesheetEdit/>}
        show={<TimesheetShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        cardList={<TimesheetsCardList/>}
        hasColumnChooser
        sort={{ field: 'hours', order: 'ASC' }}
    />
)
export const TimesheetsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Timesheets" leftIcon={<ICON />} />
)
