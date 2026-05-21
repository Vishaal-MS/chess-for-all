import { Resource, type ResourceActionDefs, type FieldSchema, createReferenceField,
    createReferenceInput, ReferenceLiveFilter, ChoicesLiveFilter, NumberLiveFilter, TextLiveFilter
} from '@mahaswami/vc-frontend';
import { SupervisorAccount } from '@mui/icons-material';
import {Menu, SelectField} from "react-admin";
import {CoachCreate, CoachEdit, CoachList} from "./coach/coaches.tsx";

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
        recordRepresentation={(record: any) => `${record?.user?.first_name} ${record?.user?.last_name}`}
        fieldSchema={ coachesFieldSchema}
        actionDefs={ coachesActionDefs}
        searchableFields={ coachesSearchableFields}
        filters={filters}
        filtersPlacement="top"
        list={<CoachList/>}
        create={<CoachCreate/>}
        edit={<CoachEdit/>}
        hasDialog
        hasLiveUpdate
        hasFilterChooser
        hasColumnChooser
        sort={{ field: 'rating', order: 'ASC' }}
    />
)
export const CoachesMenu = () => (
    <Menu.Item to={`/${RESOURCE}`} primaryText="Coaches" leftIcon={<ICON />} />
)
