import { Resource, listDefaults, type ResourceActionDefs, type FieldSchema, CardGrid, recordRep, createReferenceField,
    createReferenceInput, BooleanLiveFilter, ReferenceLiveFilter, DateLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { CastForEducation } from '@mui/icons-material';
import {List, Menu, type ListProps, DateField } from "react-admin";
import { ClassesReferenceField } from './classes.js';
import { StudentsReferenceField } from './students.js';
import {EnrollmentShow} from "./class/studentDashBoard.tsx";
import {EnrollmentsList} from "./class/enrollments.tsx";

export const RESOURCE = "enrollments"
export const ICON = CastForEducation
export const PREFETCH: string[] = ["classes", "students"]

export const EnrollmentsReferenceField = createReferenceField(RESOURCE, PREFETCH);
export const EnrollmentsReferenceInput = createReferenceInput(RESOURCE, PREFETCH);
const enrollmentsActionDefs: ResourceActionDefs = {};

const filters = [
    <TextLiveFilter source="search" show />,
    <ReferenceLiveFilter source="class_id" reference="classes" label="Class" />,
    <ReferenceLiveFilter source="student_id" reference="students" label="Student" />,
    <DateLiveFilter source="enrollment_date" label="Enrollment" />,
    <DateLiveFilter source="completion_date" label="Completion" />,
    <BooleanLiveFilter source="is_certificate_due" label="Certificate Due" />
]

export const EnrollmentsCardList = (props: ListProps) => {
    return (
        <List {...listDefaults(props)} component={'div'}>
            <CardGrid title={<ClassesReferenceField source="class_id" variant='h6' link={false} />}>
                <StudentsReferenceField source="student_id" />
                <DateField source="enrollment_date" />
            </CardGrid>
        </List>
    )
}

const enrollmentsFieldSchema: FieldSchema = {
    class_id: { resource: 'classes' },
    student_id: { resource: 'students' },
    enrollment_date: {},
    completion_date: {},
    grade: {},
    status: {},
    is_certificate_due: {}
};
const enrollmentsSearchableFields: string[] = [
    'grade',
    'status'
];

export const EnrollmentsResource = (
    <Resource
        name={RESOURCE}
        icon={ICON}
        prefetch={PREFETCH}
        recordRepresentation={(record: any) => recordRep('classes', record.class)}
        fieldSchema={ enrollmentsFieldSchema}
        actionDefs={ enrollmentsActionDefs}
        searchableFields={ enrollmentsSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<EnrollmentsList/>}
        show={<EnrollmentShow/>}
        hasLiveUpdate
        hasFilterChooser
        cardList={<EnrollmentsCardList/>}
        hasColumnChooser
        sort={{ field: 'grade', order: 'ASC' }}
    />
)
export const EnrollmentsMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="My Classes" leftIcon={<ICON />} />
)
