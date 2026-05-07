import { Resource, createDefaults, tableDefaults,
	editDefaults, tabbedFormDefaults, layoutDefaults, listDefaults, showDefaults,
	RowActions, DataTable, WizardForm, createReferenceField, createReferenceInput,
	type ResourceActionDefs, type FieldSchema, recordRep, SimpleShowLayout, CardGrid, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter} from '@mahaswami/vc-frontend';
import { Class } from '@mui/icons-material';
import { Create, Edit, List, Menu, Show,
    TabbedForm, TabbedShowLayout,
    type ListProps, TextField, TextInput, DateField, DateInput, BooleanField, BooleanInput, AutocompleteInput, required} from "react-admin";
import { ScheduleTypesReferenceField, ScheduleTypesReferenceInput } from './schedule_types.js';
import { Box } from '@mui/material';
import CreateClass from "./class/create/Create.tsx";

export const RESOURCE = "classes"
export const ICON = Class
export const PREFETCH: string[] = ["schedule_types"]

export const ClassesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ClassesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const classesActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="schedule_type_id" reference="schedule_types" label="Schedule Type" />,
    <DateLiveFilter source="start_date" label="Start" />,
    <DateLiveFilter source="end_date" label="End" />,
    <BooleanLiveFilter source="is_google_calendar_enabled" label="Google Calendar Enabled" />
]

export const ClassesList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)}>
            <DataTable {...tableDefaults(RESOURCE)} hiddenColumns={['time_of_start', 'end_datetime', 'time_of_end', 'timezone', 'calendar_links', 'google_calendar_id_value', 'is_google_calendar_enabled']} >
                <DataTable.Col source="schedule_type_id" field={ScheduleTypesReferenceField}/>
                <DataTable.Col source="days" />
                <DataTable.Col source="start_date" field={DateField}/>
                <DataTable.Col source="end_date" field={DateField}/>
                <DataTable.Col source="start_datetime" />
                <DataTable.Col source="time_of_start" />
                <DataTable.Col source="end_datetime" />
                <DataTable.Col source="time_of_end" />
                <DataTable.Col source="timezone" />
                <DataTable.Col source="calendar_links" />
                <DataTable.Col source="google_calendar_id_value" />
                <DataTable.Col source="is_google_calendar_enabled" field={BooleanField}/>
                <RowActions/>
            </DataTable>
        </List>
    )
}

export const ClassesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<ScheduleTypesReferenceField source="schedule_type_id" variant='h6' link={false} />}>
                <TextField source="days" />
                <DateField source="start_date" />
            </CardGrid>
        </List>
    )
}

const SchedulesInputs = () => {
    return (
        <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: '1em', width: '100%' }}>
                <ScheduleTypesReferenceInput source="schedule_type_id">
                    <AutocompleteInput validate={required()} />
                </ScheduleTypesReferenceInput>
                <TextInput source="days" />
                <DateInput source="start_date" validate={required()} />
                <DateInput source="end_date" validate={required()} />
                <TextInput source="start_datetime" validate={required()} />
                <TextInput source="time_of_start" validate={required()} />
                <TextInput source="end_datetime" validate={required()} />
                <TextInput source="time_of_end" validate={required()} />
                <TextInput source="timezone" validate={required()} />
                <TextInput source="details" multiline rows={5} />
                <TextInput source="calendar_links" />
                <TextInput source="google_calendar_id_value" />
                <BooleanInput source="is_google_calendar_enabled" />
            </Box>
        </>
    )
}

const ClassEdit = (props: any) => {
    return (
        <Edit {...editDefaults(props)}>
            <TabbedForm {...tabbedFormDefaults(props)}>
                <TabbedForm.Tab label="Schedules">
                    <SchedulesInputs/>
                </TabbedForm.Tab>
            </TabbedForm>
        </Edit>
    )
}

// const ClassCreate = (props: any) => {
//     return (
//         <Create {...createDefaults(props)}>
//             <WizardForm>
//                 <WizardForm.Step label='Schedules'>
//                     <SchedulesInputs/>
//                 </WizardForm.Step>
//             </WizardForm>
//         </Create>
//     )
// }

const ClassShow = (props: any) => {
    return (
        <Show {...showDefaults(props)}>
            <TabbedShowLayout {...layoutDefaults(props)}>
                <TabbedShowLayout.Tab label="Schedules">
                    <SimpleShowLayout display={'grid'} gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}>
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
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
        </Show>
    )
}

const classesFieldSchema: FieldSchema = {
    schedule_type_id: { required: true, resource: 'schedule_types' },
    days: {},
    start_date: { required: true },
    end_date: { required: true },
    start_datetime: { required: true },
    time_of_start: { required: true },
    end_datetime: { required: true },
    time_of_end: { required: true },
    timezone: { required: true },
    details: { ui: 'multiline' },
    calendar_links: {},
    google_calendar_id_value: {},
    is_google_calendar_enabled: {}
};
const classesSearchableFields: string[] = [
    'days',
    'start_datetime',
    'time_of_start',
    'end_datetime',
    'time_of_end',
    'timezone',
    'calendar_links',
    'google_calendar_id_value'
];

export const ClassesResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('schedule_types', record.schedule_type)}
        fieldSchema={ classesFieldSchema}
        actionDefs={ classesActionDefs}
        searchableFields={ classesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<ClassesList/>}
        create={<CreateClass/>}
        edit={<ClassEdit/>}
        show={<ClassShow/>}
        hasLiveUpdate
        hasFilterChooser
        cardList={<ClassesCardList/>}
        hasColumnChooser
        sort={{ field: 'days', order: 'ASC' }}
    />
)
export const ClassesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Classes" leftIcon={<ICON />} />
)
