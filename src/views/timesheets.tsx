import { Resource, type ResourceActionDefs, type FieldSchema, recordRep, createReferenceField,
    createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { AccessTime } from '@mui/icons-material';
import { Menu } from "react-admin";
import {TimeSheetCreate, TimeSheetEdit, TimeSheetList, TimesheetShow} from "./coach/coachtimesheet.tsx";

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
        list={<TimeSheetList/>}
        create={<TimeSheetCreate/>}
        edit={<TimeSheetEdit/>}
        show={<TimesheetShow/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'hours', order: 'ASC' }}
    />
)
export const TimesheetsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Timesheets" leftIcon={<ICON />} />
)
