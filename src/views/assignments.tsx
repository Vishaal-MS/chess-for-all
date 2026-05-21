import { Resource, type ResourceActionDefs, type FieldSchema, recordRep, createReferenceField, createReferenceInput } from '@mahaswami/vc-frontend';
import { Pages } from '@mui/icons-material';
export const RESOURCE = "assignments"
export const ICON = Pages
export const PREFETCH: string[] = ["classes", "lessons", "students"]

export const AssignmentsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const AssignmentsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const assignmentsActionDefs: ResourceActionDefs = {};

const assignmentsFieldSchema: FieldSchema = {
    class_id: { resource: 'classes' },
    lesson_id: { resource: 'lessons' },
    student_id: { resource: 'students' },
    status: {},
    completed_blocks: {},
    total_blocks: {},
    unique_direct_assignment_identifier: {},
    assigned_timestamp: {},
    completed_date: {},
    last_accessed_date: {},
    time_spent: {},
    is_assessment: {}
};
const assignmentsSearchableFields: string[] = [
    'status',
    'completed_blocks',
    'total_blocks',
    'unique_direct_assignment_identifier',
    'time_spent'
];

export const AssignmentsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('classes', record.class)}
        fieldSchema={ assignmentsFieldSchema}
        actionDefs={ assignmentsActionDefs}
        searchableFields={ assignmentsSearchableFields}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'status', order: 'ASC' }}
    />
)