import { Resource, listDefaults, createReferenceField, createReferenceInput,
	type ResourceActionDefs, type FieldSchema, CardGrid, MultiselectChoicesFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { CastForEducation } from '@mui/icons-material';
import { List, Menu, type ListProps, TextField} from "react-admin";
import CreateClass from "./class/create/Create.tsx";
import {ClassEdit} from "./class/ClassEdit.tsx";
import {MyClassesList} from "./class/ClassList.tsx";
import {MyClassShow} from "./class/ClassShow.tsx";
import {TeachingModesReferenceField} from "./teaching_modes.tsx";
import {isCoach} from "../backend/common_logics.ts";

export const RESOURCE = "classes"
export const ICON = CastForEducation
export const PREFETCH: string[] = ["schedule_types"]

export const ClassesReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const ClassesReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const classesActionDefs: ResourceActionDefs = {};

const StatusFilter = (props: any) => {
    const filterClassesStatusChoices = [
        { id: 'active', name: 'Active' },
        { id: 'completed', name: 'Completed' },
        { id: 'scheduled', name: 'Scheduled' }
    ];
    return <MultiselectChoicesFilter { ...props } choices={filterClassesStatusChoices} />
}

const filters = [
    <TextLiveFilter source="search" show />,
    <StatusFilter source="status" label="Status" show />
];

export const ClassesCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<TextField source="name" />}>
                <TextField source='status' />
                <TeachingModesReferenceField source='teaching_mode_id' />
            </CardGrid>
        </List>
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
        recordRepresentation={(record: any) => record?.name}
        fieldSchema={ classesFieldSchema}
        actionDefs={ classesActionDefs}
        searchableFields={ classesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<MyClassesList/>}
        create={<CreateClass/>}
        edit={<ClassEdit/>}
        show={<MyClassShow/>}
        hasLiveUpdate
        hasFilterChooser
        cardList={<ClassesCardList/>}
        hasColumnChooser
        sort={{ field: 'days', order: 'ASC' }}
    />
)
export const ClassesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText={isCoach() ? 'Workspace': 'Classes'} leftIcon={<ICON />} />
)
