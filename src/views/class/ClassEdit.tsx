import {useEffect, useState} from "react";
import {
    Button,
    DateField,
    DateInput, DeleteButton, Edit,
    FormDataConsumer,
    ReferenceManyField, required,
    TabbedForm,
    TextField,
    TextInput, TopToolbar,
    useGetRecordId, useRecordContext,
    useRefresh
} from "react-admin";
import {
    isAcademy, isRegularSchoolFlavored, isExecutiveCoachingFlavored
} from "../../businessLogic";
import { Box } from "@mui/material";
import {useNavigate} from "react-router-dom";
import {
    DataTable, editDefaults,
    openDialog,
    PER_PAGE,
    SensibleDefaultPagination, tableDefaults
} from "@mahaswami/vc-frontend";
import {ScheduleCreate, ScheduleEdit} from "./schedules";
import {AddLessons} from "./addLessons";
import {ClassLessonsSorter} from "../common/draggableLessons";
import {EnrollStudentsButton} from "./addStudents";
import {Empty} from "../common/empty";
import {RecordTitle} from "../../components/Title.tsx";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {ExtendedSchoolClassFields} from "./ExtendedSchoolClassFields.tsx";
import {classNameValidation, validateEndDate} from "../../backend/classes.ts";
import { AvatarField } from "../../fields/AvatarField.tsx";
import { getSimpleDate } from "../../utils.ts";
import {TeachingModesReferenceInput} from "../teaching_modes.tsx";
import {CoachesReferenceInput} from "../coaches.tsx";
import {StandardGradesReferenceField} from "../standard_grades.tsx";
import {UsersReferenceField} from "../users.tsx";
import {ClientsReferenceField} from "../clients.tsx";
import {ScheduleTypesReferenceField} from "../schedule_types.tsx";

export const ClassEdit = (props) => {
    const recordId= Number(useGetRecordId());
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [coaches, setCoaches] = useState([]);
    const navigate = useNavigate();
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const tabFormStyle = { height: 'calc(100vh - 16rem)', width: '100%', overflow: 'auto'};

    useEffect(() => {
        const fetchCoaches = async () => {
            const { data: coaches } = await dataProvider.getList('coaches', {meta: { prefetch: ['users']}});
            setCoaches(coaches);
        }
        fetchCoaches();
    },[recordId]);

    const EditActions = () => (
        <TopToolbar>
            <Button startIcon={<KeyboardReturnIcon />} label={`Return to ${isRegularSchoolFlavored() ? 'teacher': 'coach'} workspace`}
                onClick={() => navigate(`/classes/${recordId}/show`)}/>
        </TopToolbar>
    )

    const StartDateInput = () => {
        const record = useRecordContext();
        const now = new Date();
        const startDate = new Date(record?.start_date);
        const minStartDate = record?.start_date ? (startDate > now ? now : startDate) : now
        return (
            <DateInput source="start_date" label="Start Date" required
                       slotProps={{htmlInput: {min: getSimpleDate(minStartDate)}}}/>
        )
    }
    const validateClassOnEdit = (values) => {
        const errors = {};
        const coachUser = coaches.find((coach: any) => coach.id === values.coach_id)?.user;
        if (!coachUser.is_active){
            errors.coach_id = "This coach is inactive and cannot be added to the class.";
        }
        return errors;
    }
    return(
        <Edit {...editDefaults(props)} {...props} actions={<EditActions />}>
            <TabbedForm validate={validateClassOnEdit}>
                <TabbedForm.Tab label={"Class Details"}>
                    <Box sx={tabFormStyle}>
                        <TextInput source="name" validate={[required(), classNameValidation]}/>
                        {isAcademy() && <CoachesReferenceInput label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} source='coach_id' />}
                        <FormDataConsumer>
                            {({formData}) => {
                                const isSchoolClass = formData?.is_school_class;
                                return (
                                    <>
                                        {!isSchoolClass ?
                                            <TeachingModesReferenceInput label="Coaching Mode"
                                                source={"teaching_mode_id"} link={false}
                                                sort={{field: 'name', order: 'ASC'}} perPage={1000}
                                                queryOptions={{ meta: {scopingEscapeHatch: true}}} /> :
                                            <ExtendedSchoolClassFields/>
                                        }
                                    </>
                                )
                            }}
                        </FormDataConsumer>
                        <StartDateInput/>
                        <DateInput source="end_date" label="End Date" validate={[required(), validateEndDate]}
                                   slotProps={{htmlInput: {min: new Date().toISOString().split('T')[0]}}}/>
                    </Box>
                </TabbedForm.Tab>
                <TabbedForm.Tab label={isExecutiveCoachingFlavor ? "Executives" : "Students"}>
                    <ClassEnrolledStudentTab/>
                </TabbedForm.Tab>
                <TabbedForm.Tab label={"Lessons"}>
                    <ClassLessonTab/>
                </TabbedForm.Tab>
                    <ClassScheduleTab/>
            </TabbedForm>
        </Edit>
    );
}

export const AddLessonButton = () => {
    const record = useRecordContext();
    const refresh = useRefresh();

    const showAddLessonDialog = () => {
        openDialog(<AddLessons classRecord={record} refreshFn={refresh} width={'80vw'}/>);
    }

    return (<Button label="Add" onClick={showAddLessonDialog}  variant="contained" sx={{marginTop: 1 }} />)
}

const ClassEnrolledStudentTab = (props) => {
    const record = useRecordContext();
    const isSchoolClass = record?.is_school_class;
    const refresh = useRefresh();
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const tabFormStyle = { height: 'calc(100vh - 16rem)', width: '100%', overflow: 'auto'};

    return (
        <Box sx={tabFormStyle}>
            <ReferenceManyField pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} reference="enrollments"
                                target={"class_id"} queryOptions={{meta: {prefetch: ['students']}}}>
                <DataTable {...tableDefaults(props)} empty={<Empty emptyText={`No ${isExecutiveCoachingFlavor ? 'executives' : 'students'} yet`}/>} bulkActionButtons={false}
                          rowClick={false} sx={{maxHeight: '44vh', width: '100%', overflow: 'auto'}}>
                    <DataTable.Col label={isExecutiveCoachingFlavor ? 'Executive' : 'Student'}  source='student.user_id'
                                   field={(props) =>
                                        <UsersReferenceField { ...props } link={false} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <AvatarField/>
                                            <TextField source="fullName"/>
                                        </UsersReferenceField>
                                   } />
                    {!(isSchoolClass || isExecutiveCoachingFlavor) &&
                        <DataTable.Col label="Type" source="student.client_id" field={(props) =>
                            <ClientsReferenceField { ...props } link={false}>
                                <TextField source="client_type.name"/>
                            </ClientsReferenceField>
                        } />
                    }
                    {!(isSchoolClass || isExecutiveCoachingFlavor) &&
                        <DataTable.Col source="student.client_id" label="Client" field={ClientsReferenceField} />}
                    <DataTable.Col source="student.emergency_contact" label="Emergency Contact"/>
                    {!isExecutiveCoachingFlavor && (
                        !isSchoolClass ?
                            <DataTable.Col source="student.grade" label="Grade"/> :
                            <DataTable.Col source="student.standard_grade_id" field={StandardGradesReferenceField} label="Grade" />
                    )}
                    <DataTable.Col label={false}>
                        <DeleteButton label={false} redirect={`/classes/${record?.id}/1`}/>
                    </DataTable.Col>
                </DataTable>
            </ReferenceManyField>
            <EnrollStudentsButton classRecord={record} refreshFn={refresh}/>
        </Box>
    )
}

const ClassLessonTab = (props) => {
    const record = useRecordContext();
    const isSchoolClass = record?.is_school_class;
    const tabFormStyle = { height: 'calc(100vh - 16rem)', width: '100%', overflow: 'auto'};


    return(
        <Box sx={tabFormStyle}>
            <ReferenceManyField pagination={<SensibleDefaultPagination />} reference={"class_progress"} target={"class_id"}
                                sort={{field: 'position_number', order: 'ASC'}} queryOptions={{meta: {prefetch: ['lessons']}}}>
                <ClassLessonsSorter recordId={record?.id} isSchoolClass={isSchoolClass}/>
            </ReferenceManyField>
            <AddLessonButton />
        </Box>
    )
}

const ClassScheduleTab = (props) => {
    const record = useRecordContext();
    const isSchoolClass = record?.is_school_class;
    const tabFormStyle = { height: 'calc(100vh - 16rem)', width: '100%', overflow: 'auto'};

    const addScheduleAction = () => {
        openDialog(<ScheduleCreate classId={record?.id} width={'53vw'}/>);
    }

    return (
        <>
            {!isSchoolClass &&
                    <TabbedForm.Tab label={"Schedules"} {...props}>
                        <Box sx={tabFormStyle}>
                        <ReferenceManyField pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} reference={"class_schedules"}
                                            target="class_id" queryOptions={{meta: {scopingEscapeHatch: true}}}>
                            <DataTable {...tableDefaults(props)} bulkActionButtons={false} empty={<Empty emptyText={'No schedules added yet'}/>}
                                      rowClick={(id) => openDialog(<ScheduleEdit id={id} width="60vw"/>) } sx={{maxHeight: 'calc(100vh - 22rem)', overflow: 'auto'}}>
                                <DataTable.Col source="schedule_type_id" field={ScheduleTypesReferenceField}/>
                                <DataTable.Col source="start_date" label="Start Date" field={DateField} />
                                <DataTable.Col source="end_date" label="End Date" field={DateField} />
                                <DataTable.Col source="time_of_start" label={"Start Time"}/>
                                <DataTable.Col source="time_of_end" label={"End Time"}/>
                                <DataTable.Col source="days" sx={{textTransform: 'capitalize'}}/>
                                <DataTable.Col source="details"/>
                                <DataTable.Col label={false}>
                                    <DeleteButton label={false} redirect={`/classes/${record?.id}/3`}/>
                                </DataTable.Col>
                            </DataTable>
                        </ReferenceManyField>
                        <Button label="Add" onClick={addScheduleAction}  variant="contained" sx={{marginY: "0.5rem"}}/>
                        </Box>
                    </TabbedForm.Tab>

            }
        </>
    )
}