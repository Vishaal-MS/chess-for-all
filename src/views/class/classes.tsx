import {useEffect, useRef, useState} from "react";
import {
    AutocompleteInput, BooleanField,
    Button,
    CreateButton,
    Datagrid,
    DateField,
    DateInput, DeleteButton,
    EditButton, FormDataConsumer,
    FunctionField,
    ImageField,
    RecordContextProvider,
    ReferenceField,
    ReferenceInput,
    ReferenceManyCount,
    ReferenceManyField, required, Show, SimpleList,
    TabbedForm,
    TextField,
    TextInput, Toolbar, TopToolbar,
    useGetRecordId, useListContext,
    useNotify, useRecordContext, useRedirect,
    useRefresh,
    useUnselectAll, WithListContext,
    WithRecord
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
    Grid, Typography,
} from "@mui/material";
import {isProCoach} from "../../businessLogic";
import {SearchInput} from "ra-ui-materialui";
import {Navigate, useNavigate} from "react-router-dom";
import { getLocalStorage, openDialog, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";

import {ScheduleCreate, ScheduleEdit} from "./schedules";
import {AddLessons} from "./addLessons";
import {ClassLessonsSorter} from "../common/draggableLessons";
import {EnrollStudentsButton} from "./addStudents";
import {Empty} from "../common/empty";
import {ListTitle, RecordTitle} from "../../components/Title.tsx";
import {ClassesStatus} from "../../helpers/constants.ts";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import FilterMultiChoiceInput from "../common/FilterMultiChoiceInput.tsx";
import {ExtendedSchoolClassFields} from "./ExtendedSchoolClassFields.tsx";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import {classNameValidation, validateEndDate, validateStartDate} from "../../backend/classes.ts";
import { AvatarField } from "../../fields/AvatarField.tsx";
import { getSimpleDate } from "../../utils.ts";
import { SwanEdit, SwanList } from "../swan_crud/SwanCrud.tsx";

export const myClassesStatusChoices = [
    { id: ClassesStatus.ACTIVE, name: 'Active' },
    { id: ClassesStatus.COMPLETED, name: 'Completed' },
    { id: ClassesStatus.SCHEDULED, name: 'Scheduled' }
];

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

export const MyClassesList = () => {
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
                meta: {prefetch: ['users']}
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
        <SwanList actions={isOrgAdmin() || isDivisionAdmin() || isProCoach() ? <CreateToolBar /> : false} filters={classFilters}
              title={<ListTitle resourceName={`${isRegularSchoolFlavored() ? 'Teacher' : 'Coach'} Workspace`}/>} sort={{field: 'start_date', order: 'DESC'}}
              pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} exporter={false}
              empty={isSchoolStandardLinked() ? <EmptyClassComponent /> : <EmptyComponent/>}
        >
            <ClassDataWithFilter />
        </SwanList>
    );
}

const ClassDataWithFilter = () => {
    const {data, filterValues, setFilters} = useListContext();
    const defaultSetRef = useRef(true);
    const isSchoolStandardLink = isSchoolStandardLinked();
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
        <Datagrid bulkActionButtons={false}>
            <TextField source={"name"} label="Name"/>
            {!(isRegularSchoolFlavored() || isExecutiveCoachingFlavor) && <ReferenceField source={"teaching_mode_id"} label="Coaching Mode"
                reference={"teaching_modes"} link={false} queryOptions={{meta: {scopingEscapeHatch:true}}}/>}
            <DateField source="start_date" label="Start Date" />
            <DateField source="end_date" label="End Date" />
            <TextField source={"status"} label="Status" sx={{textTransform: 'capitalize'}}/>
            {isAcademy() && !isOrgCoach() &&
                <ReferenceField label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} source={"coach_id"}
                                reference={"coaches"} link={false} queryOptions={{meta: {prefetch: ['users']}}}>
                    <TextField source={"user.fullName"}/>
                </ReferenceField>
            }
            {isSchoolStandardLinked() && <BooleanField source={'is_school_class'} label={"Is School Class"}/>}
            {isSchoolStandardLinked() && <ReferenceField reference="standard_grades" source="standard_grade_id" />}
        </Datagrid>
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


export const MyClassShow = () => {
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
        <Show title={<RecordTitle resourceName={isProCoach() || isOrgCoach() || isStudent() ? 'Classes Show': 'Classes Show'}/>} component={'div'} actions={false} sx={{
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
                                            <ReferenceField source="student_id" reference="students" link={false}>
                                                <ReferenceField source="user_id" reference="users" link={false}>
                                                    <TextField source="fullName" />
                                                </ReferenceField>
                                            </ReferenceField>
                                        )}
                                        leftAvatar={() => (
                                            <ReferenceField source="student_id" reference="students" link={false}>
                                                <ReferenceField source="user_id" reference="users" link={false}>
                                                    <FunctionField render={(user) => (
                                                        user?.image_file_id ? (
                                                            <Avatar>
                                                                <ImageField source="image_file_id" src="src" />
                                                            </Avatar>
                                                        ) : (
                                                            <Avatar>
                                                                {user?.fullName?.substring(0, 2).toUpperCase()}
                                                            </Avatar>
                                                        )
                                                    )}/>
                                                </ReferenceField>
                                            </ReferenceField>
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
                    <Grid item xs={12} md={5}>
                        <Typography>
                            Discussion board
                        </Typography>
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
    const refresh= useRefresh();
    const navigate = useNavigate();
    const record = useRecordContext();
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const tabFormStyle = { height: 'calc(100vh - 16rem)', width: '100%', overflow: 'auto'};
    const addScheduleAction = () => {
        openDialog(<ScheduleCreate classId={recordId} width={'60vw'}/>);
    }

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
        <SwanEdit actions={<EditActions />} title={<RecordTitle resourceName={`${isRegularSchoolFlavored() ? 'Teacher': 'Coach'} Workspace`}/>}
             {...props} mutationMode="pessimistic">
            <TabbedForm validate={validateClassOnEdit}>
                <TabbedForm.Tab label={"Class Details"} >
                    <Box sx={tabFormStyle}>
                        <TextInput source="name" validate={[required(), classNameValidation]}/>

                        {isAcademy() && <ReferenceInput source={"coach_id"} queryOptions={{meta: {prefetch: ['users']}}}
                                                        reference={"coaches"} link={false}>
                            <AutocompleteInput optionText={"user.fullName"}
                                               label={isRegularSchoolFlavored() ? "Teacher" : "Coach"}/>
                        </ReferenceInput>}
                        <FormDataConsumer>
                            {({formData}) => {
                                const isSchoolClass = formData?.is_school_class;
                                return (
                                    <>
                                        {!isSchoolClass ?
                                            <ReferenceInput source={"teaching_mode_id"} reference={"teaching_modes"}
                                                            link={false}
                                                            sort={{field: 'name', order: 'ASC'}}
                                                            queryOptions={{meta: {scopingEscapeHatch: true}}}
                                                            perPage={1000}>
                                                <AutocompleteInput optionText={"name"} label="Coaching Mode"/>
                                            </ReferenceInput> :
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
        </SwanEdit>
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

const ClassEnrolledStudentTab = () => {
    const record = useRecordContext();
    const isSchoolClass = record?.is_school_class;
    const refresh = useRefresh();
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const tabFormStyle = { height: 'calc(100vh - 16rem)', width: '100%', overflow: 'auto'};

    return (
        <Box sx={tabFormStyle}>
            <ReferenceManyField pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE} reference="enrollments"
                                target={"class_id"} queryOptions={{meta: {prefetch: ['students']}}}>
                <Datagrid empty={<Empty emptyText={`No ${isExecutiveCoachingFlavor ? 'executives' : 'students'} yet`}/>} bulkActionButtons={false}
                          rowClick={false} sx={{maxHeight: '44vh', width: '100%', overflow: 'auto'}}>
                    <ReferenceField source="student.user_id" label={isExecutiveCoachingFlavor ? 'Executive' : 'Student'} reference="users" link={false} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AvatarField/>
                        <TextField source="fullName"/>
                    </ReferenceField>
                    {!(isSchoolClass || isExecutiveCoachingFlavor) && <ReferenceField source="student.client_id" reference="clients" label="Type"
                                                       queryOptions={{meta: {prefetch: ['client_types']}}} link={false}>
                        <TextField source="client_type.name"/>
                    </ReferenceField>}
                    {!(isSchoolClass || isExecutiveCoachingFlavor) &&
                        <ReferenceField source="student.client_id" label="Client" reference="clients" link={false}/>}
                    <TextField source="student.emergency_contact" label="Emergency Contact"/>
                    {!isExecutiveCoachingFlavor && (
                        !isSchoolClass ?
                            <TextField source="student.grade" label="Grade"/> :
                            <ReferenceField source="student.standard_grade_id" reference={"standard_grades"} label="Grade" link={false}>
                                <TextField source={'name'}/>
                            </ReferenceField>
                    )}

                    <DeleteButton label={false} redirect={`/classes/${record?.id}/1`}/>
                </Datagrid>
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
                                sort={{field: 'position_number', order: 'ASC'}} queryOptions={{meta: {prefetch: ['lessons', 'standard_sections', 'cognitive_skills']}}}>
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
                            <Datagrid bulkActionButtons={false} empty={<Empty emptyText={'No schedules added yet'}/>}
                                      rowClick={(id) => openDialog(<ScheduleEdit id={id} width="60vw"/>) } sx={{maxHeight: 'calc(100vh - 22rem)', overflow: 'auto'}}>
                                <ReferenceField source="schedule_type_id" reference={"schedule_types"} label="Schedule Type"/>
                                <DateField source="start_date" label="Start Date"/>
                                <DateField source="end_date" label="End Date"/>
                                <TextField source="time_of_start" label={"Start Time"}/>
                                <TextField source="time_of_end" label={"End Time"}/>
                                <TextField source="days" sx={{textTransform: 'capitalize'}}/>
                                <TextField source="details"/>
                                <DeleteButton label={false} redirect={`/classes/${record?.id}/3`}/>
                            </Datagrid>
                        </ReferenceManyField>
                        <Button label="Add" onClick={addScheduleAction}  variant="contained" sx={{marginY: "0.5rem"}}/>
                        </Box>
                    </TabbedForm.Tab>

            }
        </>
    )
}