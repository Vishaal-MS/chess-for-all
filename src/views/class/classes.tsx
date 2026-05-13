import {useEffect, useRef, useState} from "react";
import {
    AutocompleteInput, BooleanField,
    Button,
    CreateButton,
    DateField,
    DateInput, DeleteButton, Edit,
    EditButton, FormDataConsumer,
    FunctionField,
    ImageField, Link, List,
    ReferenceManyCount,
    ReferenceManyField, required, SelectField, Show, SimpleList,
    TabbedForm,
    TextField,
    TextInput, Toolbar, TopToolbar,
    useGetRecordId, useListContext,
    useNotify, useRecordContext,
    useRefresh, WithListContext
} from "react-admin";
import {
    isAcademy,
    isOrgAdmin,
    isOrgCoach,
    isDivisionAdmin,
    isStudent,
    isDivisionCoach, isSchoolStandardLinked, isRegularSchoolFlavored, isExecutiveCoachingFlavored
} from "../../businessLogic";
import {
    Avatar,
    Box,
    Card, CardContent, CardHeader,
    Grid, Stack, Tooltip, Typography,
} from "@mui/material";
import {isProCoach} from "../../businessLogic";
import {SearchInput} from "ra-ui-materialui";
import {useNavigate} from "react-router-dom";
import {
    DataTable, editDefaults,
    getLocalStorage,
    listDefaults,
    openDialog,
    PER_PAGE,
    SensibleDefaultPagination, showDefaults, tableDefaults
} from "@mahaswami/vc-frontend";
import {ScheduleCreate, ScheduleEdit} from "./schedules";
import {AddLessons} from "./addLessons";
import {ClassLessonsSorter} from "../common/draggableLessons";
import {EnrollStudentsButton} from "./addStudents";
import {Empty} from "../common/empty";
import {ListTitle, RecordTitle} from "../../components/Title.tsx";
import {ClassesStatus, classStatusChoises} from "../../helpers/constants.ts";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import FilterMultiChoiceInput from "../common/FilterMultiChoiceInput.tsx";
import {ExtendedSchoolClassFields} from "./ExtendedSchoolClassFields.tsx";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import {classNameValidation, validateEndDate} from "../../backend/classes.ts";
import { AvatarField } from "../../fields/AvatarField.tsx";
import { getSimpleDate } from "../../utils.ts";
import {ClassLessons} from "./classLessons.tsx";
import {TeachingModesReferenceField, TeachingModesReferenceInput} from "../teaching_modes.tsx";
import {CoachesReferenceField, CoachesReferenceInput} from "../coaches.tsx";
import {StandardGradesReferenceField} from "../standard_grades.tsx";
import AccordionSection from "../../components/AccordionSection.tsx";
import SchedulePreview from "./SchedulePreview.tsx";
import {StudentsReferenceField} from "../students.tsx";
import {UsersReferenceField} from "../users.tsx";
import {ClientsReferenceField} from "../clients.tsx";
import {ScheduleTypesReferenceField} from "../schedule_types.tsx";

const CreateToolBar = () => {
    const navigate = useNavigate();

    const handleOnClick = (type) => {
        navigate({
            pathname: '/classes/create',
            search: `?type=${type}`
        })
    }

    const SchoolClassAction = ({label}) => {
        return(
            <Button label={label} onClick={() => handleOnClick('school')}><AddIcon /></Button>
        )
    }

    const RegularClassAction = () => {
        return(
            <Button label="Set up a new Class" onClick={() => handleOnClick('regular')} ><AddIcon /></Button>
        )
    }

    if (isRegularSchoolFlavored()) {
        return (
            <TopToolbar style={{"minHeight": 40}}>
                <SchoolClassAction label={"Set up a new Class"}/>
            </TopToolbar>
        )
    }

    return (
        <TopToolbar style={{"minHeight": 40}}>
            {isSchoolStandardLinked() ?
                <>
                    <SchoolClassAction label={"Set up a new School Class"}/>
                    <RegularClassAction/>
                </> :
                <CreateButton label="Setup a new class" />
            }
        </TopToolbar>
    )
}

const EmptyClassComponent = () => {
    const navigate = useNavigate();
    const handleOnClick = (type) => {
        navigate({pathname: '/classes/create', search: `?type=${type}`})
    }
    return (
        <Box style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            height: "calc(100vh - 200px)"
        }}>
            <Typography sx={{color: 'grey'}} variant="h4" gutterBottom>
                {"No Class Yet"}
            </Typography>
            <Toolbar>
                <Button label={"Set up a new School Class"} onClick={() => handleOnClick('school')}><AddIcon/></Button>
                <Button label="Set up a new Class" onClick={() => handleOnClick('regular')}><AddIcon/></Button>
            </Toolbar>
        </Box>
    )
}

const EmptyComponent = () => {
    if (isOrgCoach() || isDivisionCoach()) {
        return <Empty emptyText={"You are not assigned to any class."} showCreateIfApplicable={false}/>
    }
    return <Empty emptyText={""}/>
}

export const MyClassesList = (props: any) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const navigate = useNavigate();
    const [state, setState] = useState<any>({
        coachList: [],
        gradeChoise: []
    })

    useEffect(() => {
        const getGradeChoise = async () => {
            const { data: standardGrades } = await dataProvider.getList('standard_grades', {
                meta: { scopingEscapeHatch: true },
                sort: { field: 'name', order: 'ASC' }
            });
            const gradeMap = new Map();
            standardGrades.forEach(({ id, name }) => {
                if (gradeMap.has(name)) {
                    const existingGrade = gradeMap.get(name);
                    existingGrade.id = [...existingGrade.id, id];
                } else {
                    gradeMap.set(name, { id: [id], name });
                }
            });
            const gradeChoise = Array.from(gradeMap.values());
            setState((prevState: any) => ({...prevState, gradeChoise: gradeChoise}));
        }
        getGradeChoise();
        const totalClassesAtLogin = getLocalStorage("total_classes_at_login");
        if (totalClassesAtLogin === 0 && (isOrgAdmin() || isProCoach())) {
            if (isRegularSchoolFlavored()) {
                navigate("/classes/create?type=school")
            } else if (isSchoolStandardLinked()) {
                navigate("/classes")
            } else {
                navigate("/classes/create")
            }
        }
    }, []);

    useEffect(() => {
        const fetchCoachList = async () => {
            const {data: currentTenantCoachList} = await dataProvider.getList('coaches', {
                meta: { prefetch: ['users'] }
            })
            const sortedCoachList = currentTenantCoachList.sort((a: any, b: any) => a.user.last_name.toLowerCase().localeCompare(b.user.last_name.toLowerCase()));
            const coachUserList = new Map();
            sortedCoachList.forEach((coach: any) => {
                if (coach.user_id && !coachUserList.has(coach.id)) {
                    coachUserList.set(coach.id, {
                        id: coach.id,
                        name: coach.user.fullName
                    });
                }
            });
            const currentCoachesNameList = Array.from(coachUserList.values());
            setState((prevState: any) => ({...prevState, coachList: currentCoachesNameList}));
        }
        fetchCoachList();
    }, []);

    const {coachList} = state;
    const myClassesStatusChoices = [
        { id: ClassesStatus.ACTIVE, name: 'Active' },
        { id: ClassesStatus.COMPLETED, name: 'Completed' },
        { id: ClassesStatus.SCHEDULED, name: 'Scheduled' }
    ];

    const classFilters = [
        <SearchInput source="q" alwaysOn />,
        <FilterMultiChoiceInput source="status" label="Status" choices={myClassesStatusChoices} alwaysOn/>,

        ...(isAcademy() && (isOrgAdmin() || isDivisionAdmin())  ? [
               <FilterMultiChoiceInput source="coach_id" label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} choices={coachList} alwaysOn/>
            ] : []
        ),
        ...(isSchoolStandardLinked() ? [
            <AutocompleteInput label="Grade" alwaysOn
                resource="standard_grades" source="standard_grade_id" 
                choices={state.gradeChoise}
                sx={{
                    '& .MuiInputBase-root': { height: '2.5rem' },
                    '& .MuiInputBase-input': { fontSize: '0.85rem' },
                    width: '16vw' 
                }}/>
        ] : [])
    ];

    return(
        <List {...listDefaults(props)} actions={isOrgAdmin() || isDivisionAdmin() || isProCoach() ? <CreateToolBar /> : false}
              title={<ListTitle resourceName={`${isRegularSchoolFlavored() ? 'Teacher' : 'Coach'} Workspace`}/>}
              sort={{field: 'start_date', order: 'DESC'}}
              pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} exporter={false}
              empty={isSchoolStandardLinked() ? <EmptyClassComponent /> : <EmptyComponent/>}
        >
            <ClassDataWithFilter />
        </List>
    );
}

const ClassDataWithFilter = () => {
    const {data, filterValues, setFilters} = useListContext();
    const defaultSetRef = useRef(true);
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();

    useEffect(() => {
        if (defaultSetRef.current && data && data.length > 0 && !filterValues.status) {
            setFilters({
                ...filterValues, status: [ClassesStatus.ACTIVE, ClassesStatus.SCHEDULED]
            });
            defaultSetRef.current = false;
        }
    }, [data, filterValues, setFilters]);
    return (
        <DataTable bulkActionButtons={false}>
            <DataTable.Col source={"name"} />
            {!(isRegularSchoolFlavored() || isExecutiveCoachingFlavor) &&
                <DataTable.Col source="teaching_mode_id" field={(props) =>
                    <TeachingModesReferenceField { ...props } label="Coaching Mode" link={false}
                                                 queryOptions={{ meta: {scopingEscapeHatch:true }}} />} />
            }
            <DataTable.Col source="start_date" field={DateField} />
            <DataTable.Col source="end_date" field={DateField} />
            <DataTable.Col source="status" field={(props) => <SelectField {...props} choices={classStatusChoises} />} />
            {isAcademy() && !isOrgCoach() &&
                <DataTable.Col label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} source="coach_id" link={false}
                               field={(props: any) => <CoachesReferenceField {...props}>
                                   <TextField source={"user.fullName"}/>
                               </CoachesReferenceField>} />
            }
            {isSchoolStandardLinked() && <DataTable.Col source='is_school_class' field={BooleanField}/>}
            {isSchoolStandardLinked() && <StandardGradesReferenceField source="standard_grade_id" />}
        </DataTable>
    )
}

const cardHeaderSx = (theme) => ({
    p: 0,
    justifyContent: "center",
    display: "flex",
    textAlign: "center",
    background: `linear-gradient(45deg, 
      ${theme.palette.secondary.dark} 0%, 
      ${theme.palette.secondary.light} 50%, 
      ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    minHeight: 40,
});

const cardContentSx = () => ({
    height: "calc(100vh - 110px)",
    scrollbarWidth: 'none',
    overflow: 'auto',
    padding: '6px',
});


export const MyClassShow = (props: any) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const recordId = Number(useGetRecordId());
    const notify = useNotify();
    const refresh= useRefresh();
    const [classRecord,setClassRecord] = useState({});

    useEffect(() => {
        const fetchClass = async () => {
            const {data: classRecord} = await dataProvider.getOne('classes', {
                id: recordId
            });
            setClassRecord(classRecord);
        }
        fetchClass();
    },[]);


    const updateClassStatus = async (status) => {
        classRecord.status = status;
        await dataProvider.update('classes', {
                id: recordId,
                data: {...classRecord}
        });
        notify('Class marked as ' + status, {type: 'success'});
        refresh();
    }

    const ClassShowActions = () =>(
        <Stack direction={"row"} spacing={-1} sx={{marginTop: 1.5}}>
            {classRecord.status === ClassesStatus.ACTIVE &&
                <Button  title="Mark As Completed"  color="error"
                         sx={{color: (theme) =>  theme.palette.mode === "light" ? "white" : "black", minWidth: 0}}
                         startIcon={<CheckCircleRoundedIcon/>}
                         onClick={()=>{updateClassStatus(ClassesStatus.COMPLETED)}}></Button>}
            {classRecord.status === ClassesStatus.SCHEDULED &&
                <Button title="Mark As Started" color="warning"
                        sx={{color: (theme) => theme.palette.mode === "light" ? "white" : "black", minWidth: 0}}
                        startIcon={<PlayCircleFilledRoundedIcon/>}
                        onClick={()=>{updateClassStatus(ClassesStatus.ACTIVE)}}></Button>}
            <EditButton label={""} color={"warning"}
                        sx={{color: (theme) => theme.palette.mode === "light" ? "white" : "black", minWidth: 0}} title={"Edit"} />
        </Stack>
    )

    const isRemoteTeachMode: boolean = classRecord?.teaching_mode_id === 2;

    return (
        <Show {...showDefaults(props)} title={<RecordTitle resourceName={isProCoach() || isOrgCoach() || isStudent() ? 'Classes Show': 'Classes Show'}/>}
              component={'div'} actions={false} sx={{
            '& .MuiToolbar-root': {
                justifyContent: 'right',
            },
            '& .RaShow-card': {
                height: 'calc(100vh - 70px)',
            }
        }}>
            <Grid container spacing={1} sx={{height: '100%'}}>
                <Grid item xs={12} md={isRemoteTeachMode ? 4 : 6}>
                    <Card sx={{height: '100%'}}>
                        <CardHeader title={<Typography variant="h6"> Lessons</Typography>} sx={cardHeaderSx} />
                        <CardContent sx={cardContentSx}>
                            <ClassLessons classId={recordId} />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={isRemoteTeachMode ? 3 : 6}>
                    <Card sx={{height: '100%'}}>
                        <CardHeader
                            title={<Tooltip title={classRecord?.name}>
                                <Box component="div"
                                     sx={{display: 'grid', alignItems: 'center'}}>
                                    <Typography variant="h6" component="div" sx={{
                                        flex: 1,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>{classRecord?.name}</Typography>
                                </Box>
                            </Tooltip>} sx={cardHeaderSx}
                            action={<ClassShowActions/>}/>
                        <CardContent sx={cardContentSx}>
                            <AccordionSection defaultExpanded title={"Schedule"} color="LightSlateGrey">
                                <SchedulePreview />
                            </AccordionSection>
                            <AccordionSection defaultExpanded title={"Students"} color="LightSlateGrey"
                                count={<ReferenceManyCount fontWeight="bold" reference="enrollments" target="class_id" />}>
                                <ReferenceManyField
                                    reference="enrollments"
                                    target="class_id"
                                    link={false}
                                    perPage={1000}
                                >
                                    <SimpleList
                                        primaryText={() => (
                                            <StudentsReferenceField source="student_id" link={false}>
                                                <FunctionField render={student => student.user.fullName} />
                                            </StudentsReferenceField>
                                        )}
                                        leftAvatar={() => (
                                            <StudentsReferenceField source="student_id" link={false}>
                                                <FunctionField render={(student) => (
                                                    student?.user?.image_file_id ? (
                                                        <Avatar>
                                                            <ImageField source="image_file_id" src="src" />
                                                        </Avatar>
                                                    ) : (
                                                        <Avatar>
                                                            {student?.user?.fullName?.substring(0, 2).toUpperCase()}
                                                        </Avatar>
                                                    )
                                                )}/>
                                            </StudentsReferenceField>
                                        )}
                                        sx={{
                                            '& .MuiListItem-gutters': {
                                                borderBottom: '1px solid #e0e0e0',
                                            },
                                        }}
                                    />
                                </ReferenceManyField>
                            </AccordionSection>
                        </CardContent>
                    </Card>
                </Grid>
                {isRemoteTeachMode &&
                    <Grid item xs={12} md={4}>
                        <Card  sx={{height: '100%'}}>
                            <CardHeader title={<Typography variant="h6"> Discussion Board</Typography>} sx={cardHeaderSx} />
                            <CardContent sx={cardContentSx}>
                                <ReferenceManyField reference="queries" target="class_id">
                                    <WithListContext render={({ isPending, total }) => (
                                        !isPending && total > 0 && (
                                            <Button
                                                sx={{ borderRadius: 0, pt: 2 }}
                                                component={Link}
                                                to={{
                                                    pathname: '/queries',
                                                    search: `filter=${JSON.stringify({ class_id: recordId })}`,
                                                }}
                                                size="small"
                                                color="primary"
                                            >
                                                See more details
                                            </Button>
                                        )
                                    )} />
                                </ReferenceManyField>
                            </CardContent>
                        </Card>
                    </Grid>
                }
            </Grid>
        </Show>
    )
};

export const EditClass = (props) => {
    const recordId= Number(useGetRecordId());
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [coaches, setCoaches] = useState([]);
    const navigate = useNavigate();
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const tabFormStyle = { height: 'calc(100vh - 16rem)', width: '100%', overflow: 'auto'};

    useEffect(() => {
        const fetchCoaches = async () => {
            const{data: coaches} = await dataProvider.getList('coaches', {meta: { prefetch: ['users']}});
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
        <Edit {...editDefaults(props)} {...props} mutationMode="pessimistic" actions={<EditActions />}
              title={<RecordTitle resourceName={`${isRegularSchoolFlavored() ? 'Teacher': 'Coach'} Workspace`}/>}>
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