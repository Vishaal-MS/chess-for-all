import {isAcademy, isExecutiveCoachingFlavored} from "../../../businessLogic.ts";
import {
    AutocompleteInput,
    DateInput,
    required,
    TextInput
} from "react-admin";
import {classNameValidation, validateEndDate, validateStartDate} from "../../../backend/classes.ts";
import {ExtendedSchoolClassFields} from "../ExtendedSchoolClassFields.tsx";
import { Box } from '@mui/material';
import { getSimpleDate } from "../../../utils.ts";
import {TeachingModesReferenceInput} from "../../teaching_modes.tsx";
import {CoachesReferenceInput} from "../../coaches.tsx";

interface ClassDetailsProps {
    status: string;
    isSchool: boolean;
}
const ClassDetails = ({ status, isSchool }: ClassDetailsProps) => {
    const tabFormStyle = { height: 'calc(100vh - 15rem)', width: '100%', overflow: 'auto'};
    return (
        <Box sx={tabFormStyle}>
            <TextInput source="name" validate={[required(), classNameValidation]}/>
            {isAcademy() && <CoachesReferenceInput source={"coach_id"} filter={{'user.is_active': true}} link={false}>
                <AutocompleteInput optionText={"user.fullName"} validate={required()} label={isSchool ? "Teacher": "Coach"}/>
            </CoachesReferenceInput>}
            {!(isSchool || isExecutiveCoachingFlavored()) &&
                <TeachingModesReferenceInput source={"teaching_mode_id"} sort={{field: 'name', order: 'ASC'}}
                                             link={false} queryOptions={{ meta: {scopingEscapeHatch: true }}}>
                <AutocompleteInput validate={required()} label="Coaching Mode"/>
            </TeachingModesReferenceInput>}
            {isSchool && <ExtendedSchoolClassFields />}
            <DateInput source="start_date" label="Start Date" validate={[required(), validateStartDate]}
                        slotProps={{htmlInput: {min: getSimpleDate(new Date())}}}/>
            <DateInput source="end_date" label="End Date" validate={[required(), validateEndDate]}
                        slotProps={{htmlInput: {min: getSimpleDate(new Date())}}}/>
        </Box>
    )
}

export default ClassDetails;