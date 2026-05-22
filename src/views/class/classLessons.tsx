import {DataTableWithIndex} from "../../components/DataTableWithIndex.tsx";
import {Empty} from "../common/empty";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CircularProgress from '@mui/material/CircularProgress';
import {useEffect, useState, useRef, Fragment} from "react";
import {Grid, IconButton, Tooltip, Typography,Box, FormControlLabel, Switch} from "@mui/material";
import {DragDropContext, Droppable, Draggable} from "@hello-pangea/dnd";
import {useNotify,
 useListContext,List,TopToolbar, Loading, Button, useUnselectAll,useRedirect,
 ListContextProvider, ResourceContextProvider
} from "react-admin";
 import AccordionSection from "../../components/AccordionSection";
 import {formatDateWithShortYear} from "../../utils.ts";
import {openDialog, closeDialog, remoteLog, DataTable} from "@mahaswami/vc-frontend";
import {assignAssignments, sendStudentsAssignmentEmail} from "../../backend/assignments.ts";
import {ClassesStatus, ClassProgressStatus, TeachingMode} from "../../helpers/constants.ts";
import {isExecutiveCoachingFlavored} from "../../backend/common_logics.ts";
import { Info } from "@mui/icons-material";
import {getStudentIdsByEnrollments} from "../../backend/classLessons.ts";
import {UsersReferenceField} from "../users.tsx";

export const ClassLessons = ({classId}) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const dropperId_ip = ClassProgressStatus.IN_PROGRESS;
    const dropperId_uc = ClassProgressStatus.SCHEDULED;
    const dropperId_cm = ClassProgressStatus.COMPLETED;
    const [classProgress, setClassProgress] = useState([]);
    const [currentLessons, setCurrentLessons] = useState<any[]>([]);
    const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
    const [completedLessons, setCompletedLessons] = useState<any[]>([]);
    const [refreshLessons, setRefreshLessons] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isDropIsOpen, setIsDropIsOpen] = useState({current: true, upcoming: true, completed: false});

    useEffect(() => {
        const classProgressData = async (classId: number) => {
        try {
            const { data: classProgress } = await dataProvider.getList('class_progress', {
                filter: { class_id: classId },
                meta: { prefetch: ['lessons']},
                pagination: { page: 1, perPage: 1000 },
                sort: {field: 'position_number', order: 'ASC'}
            });
            const inprogressLessons = classProgress.filter(progress => progress.status === ClassProgressStatus.IN_PROGRESS);
            const comingLessons = classProgress.filter(progress => progress.status === ClassProgressStatus.SCHEDULED);
            const completeLessons = classProgress.filter(progress => progress.status === ClassProgressStatus.COMPLETED);
            setClassProgress(classProgress);
            setCurrentLessons(inprogressLessons);
            setUpcomingLessons(comingLessons);
            setCompletedLessons(completeLessons);
            setLoading(false);
        } catch (error) {
            remoteLog("Error on fetching classProgress in classLesson: ", error);
        }
      }
      classProgressData(classId);
    }, [refreshLessons]);

    const handleDragEnd = async(result) => {
        const { draggableId, source, destination } = result;
        if (!destination) {
            setIsDropIsOpen(prev => ({...prev, completed: true}));
            return;
        }
        if(source.droppableId === destination.droppableId){
            return;
        }
        if (destination.droppableId === dropperId_cm) {
            setIsDropIsOpen(prev => ({...prev, completed: true}));
        }

        const updatedProgresses = classProgress.map(item => {
            if (item.id.toString() === draggableId) {
                let updatedItem = { ...item };
                if (destination.droppableId === dropperId_ip) {
                    updatedItem.start_date = new Date();
                } else if (destination.droppableId === dropperId_cm) {
                    updatedItem.completion_date = new Date();
                } else if (destination.droppableId === dropperId_uc) {
                    updatedItem.start_date = "";
                    updatedItem.completion_date = "";
                }
                return updatedItem;
            }
            return item;
        });
      const classProgressData = updatedProgresses.find(lesson => lesson.id.toString() === draggableId);
      if (!classProgressData) return;
  
      dataProvider.update('class_progress', {
          id: draggableId,
          data: { ...classProgressData, status: destination.droppableId },
      });
      // Remove from source
      if (source.droppableId === dropperId_ip) {
          setCurrentLessons(currentLessons.filter(lesson => lesson.id.toString() !== draggableId));
      }
      if (source.droppableId === dropperId_uc) {
          setUpcomingLessons(upcomingLessons.filter(lesson => lesson.id.toString() !== draggableId));
      }
      if (source.droppableId === dropperId_cm) {
          setCompletedLessons(completedLessons.filter(lesson => lesson.id.toString() !== draggableId));
      }
      const updatedLesson = { ...classProgressData, status: destination.droppableId };
      if (destination.droppableId === dropperId_ip) {
          setCurrentLessons([...currentLessons, updatedLesson]);
      }
      if (destination.droppableId === dropperId_uc) {
          setUpcomingLessons([...upcomingLessons, updatedLesson]);
      }
      if (destination.droppableId === dropperId_cm) {
          setCompletedLessons([...completedLessons, updatedLesson]);
      }
   };
    const ucCount = upcomingLessons.length, ipCount = currentLessons.length, cmCount = completedLessons.length;
    const currentEmptyText = ipCount === 0 && ucCount === 0 && cmCount > 0 ? "All lessons completed" : 
        cmCount > 0 && ucCount > 0 ? "No current lessons" : "Lesson not added yet";
    const upcomingEmptyText = cmCount > 0 && ipCount === 0 ? "All lessons completed" : "No lesson remaining";
    const completedEmptyText = "No lesson completed yet";

    const handleLessonListToggle = (status: string) => {
        setIsDropIsOpen(prevState => ({ ...prevState, [status]: !prevState[status] }));
    }
    if (loading) return <Loading />
    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            {classProgress?.length > 0 ? (<>
            <Grid item sx={{ mb: 2 , maxHeight:'calc(25vh + 10px)'}}>
                <AccordionSection defaultExpanded
                    title="Current"
                    color="LightSlateGrey"
                    count={currentLessons?.length}
                    contentHeight={'calc(20.5vh + 10px)'}
                    onClick={() => handleLessonListToggle('current')}
                >
                    {isDropIsOpen.current && <ClassLessonListByStatus 
                        contentHeight={'calc(20.5vh - 1rem)'}
                        classId={classId} 
                        dropperId={dropperId_ip}
                        refresh={() => setRefreshLessons(refresh => !refresh)} 
                        classProgresses={currentLessons}
                        emptyText={currentEmptyText}/>}
                </AccordionSection>
            </Grid>
            <Grid item sx={{ mb: 1, maxHeight:'calc(45vh - 10px)'}}>
                <AccordionSection defaultExpanded
                    title="Upcoming"
                    color="LightSlateGrey"
                    count={upcomingLessons?.length}
                    contentHeight={'calc(45vh - 50px)'}
                    onClick={() => handleLessonListToggle('upcoming')}
                >
                    {isDropIsOpen.upcoming && <ClassLessonListByStatus 
                        contentHeight={'calc(45vh - 4rem)'}
                        classId={classId}
                        dropperId={dropperId_uc}
                        classProgresses={upcomingLessons}
                        emptyText={upcomingEmptyText}/>}
                </AccordionSection>

            </Grid>
            <Grid item>
                <AccordionSection expanded={isDropIsOpen.completed && completedLessons?.length !== 0}
                    title="Completed"
                    color="LightSlateGrey"
                    count={completedLessons?.length}
                    onClick={() => handleLessonListToggle('completed')}
                >
                    <ClassLessonListByStatus
                        contentHeight={'calc(25vh - 5rem)'}
                        classId={classId}
                        dropperId={dropperId_cm}
                        classProgresses={completedLessons}
                        emptyText={completedEmptyText}/>
                </AccordionSection>
            </Grid>
            </>) : (
               <Box sx={{alignItems: "center", display: 'flex', justifyContent: 'center', height: '100%'}}>
                   <Empty showIcon={false} emptyText={'Lesson Not added yet'}/>
               </Box>
            )}
        </DragDropContext>
    );
}

const ClassLessonListByStatus = ({contentHeight, classId, dropperId, classProgresses, emptyText, refresh}) => {
    const notify = useNotify();
    const unselectAll = useUnselectAll('students');
    const listRefetch = useRef(null);
    const redirect = useRedirect();
    const [assignmentLoadingIds, setAssignmentLoadingIds] = useState<number[]>([]);
    const [clickedButtonId, setClickedButtonId] = useState();
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();

    const handleSendAssignment = async (classProgress, classData, students, isAssessment) => {
        setAssignmentLoadingIds(prev => [...prev, classProgress.id]);
        const teachingMode = classData.teaching_mode.name;
        await assignAssignments(classProgress, classData, teachingMode, students, isAssessment);
        listRefetch.current?.().then(() => {
            setAssignmentLoadingIds(prev => prev.filter(id => id !== classProgress.id));
            if(teachingMode === TeachingMode.IN_PERSON){
               redirect(`/class_progress/${classProgress.id}/show/1`)
            }
        });
        notify(`Assignments assigned to ${isExecutiveCoachingFlavor ? 'executives': 'students'} `, {type: 'success'});
        if (students && students.length > 0) {
            unselectAll();
            closeDialog();
            setAssignmentLoadingIds([]);
            setClickedButtonId(null);
            refresh();
        }
    }

    const CustomDatagrid = ({ children, data, ...props }) => {
        const { isLoading, onSelect, setFilters } = useListContext();
        useEffect(() => {
            if (data.length > 0) {
             const studentIds = data ? data.map(student => student.id) : [];
             onSelect(studentIds);
             setFilters({}, {});
            }
        }, [data]);

        return (
             <DataTable {...props}>
                {children}
            </DataTable>
        );
    };

    const AssignToStudentButton = ({ classProgress, classData, students, isAssessment }) => {
        const{ selectedIds } = useListContext();
        const [loading, setLoading] = useState(false);
        const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
        const selectedStudent = students?.filter(student => selectedIds.includes(student.id));
        return(
            <Button 
                label={`Assign ${isExecutiveCoachingFlavor ? 'Executives' : 'Students'}`}
                loading={loading} 
                onClick={() => {
                    setLoading(true); 
                    handleSendAssignment(classProgress, classData, selectedStudent, isAssessment)
                }}/>
            );
    }

    const AssignedStudentsDialog = ({classProgress, studentIds, students, assignedStudentCount, classData}) => {
        const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
        const [isAssessment, setIsAssessment] = useState(false);
        const EmptyActions = () => <TopToolbar></TopToolbar>;
        return (
            <>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Typography variant="h6" sx={{pb: "0.5rem"}}>{`Select ${isExecutiveCoachingFlavor ? 'Executives' : 'Students' }`}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                        <FormControlLabel
                            control={
                                <Switch/>
                            }
                            onChange={() => setIsAssessment(!isAssessment)}
                            checked={isAssessment}
                            label="Assign as Assessment"
                        />
                        <Tooltip placement="top" title={<>Toggle ON = Used for scoring<br/> Toggle OFF = Considered as practice</>}>
                            <Info sx={{ fontSize: '1.2rem', color: (theme) => theme.palette.grey[600] }}/>
                        </Tooltip>
                    </Box>
                </Box>
                {assignedStudentCount > 0 && <Typography variant="h6" sx={{ fontSize: '16px' }}> Already assigned students ({assignedStudentCount}) excluded </Typography>}
                <List actions={<EmptyActions/>} empty={<Empty empty={`No ${isExecutiveCoachingFlavor ? 'Executives ' : 'Students ' } Yet`} />} disableSyncWithLocation
                    storeKey={"StudentsListForAdd"} resource="students" filter={{id:studentIds}}  exporter={false}>
                    <CustomDatagrid
                        bulkActionButtons={<AssignToStudentButton classProgress={classProgress} classData={classData} students={students} isAssessment={isAssessment}/>} 
                        rowClick={false} data={students}>
                        <DataTable.Col label='User' field={() => <UsersReferenceField source="user_id" link={false}/>} />
                    </CustomDatagrid>
                </List>
           </>
        )
    }

    const handleOnClickAssignment = async (e: any, classProgress: any) => {
        setClickedButtonId(classProgress.id);
        e.stopPropagation();
        unselectAll();
        await showUnassignedStudentDialog(classProgress, classId);
    };

    const showUnassignedStudentDialog = async (classProgress: any, classId: number) => {
        try {
            const dataProvider = window.swanAppFunctions.dataProvider;
            const data = await getStudentIdsByEnrollments(classProgress, classId);
            const studentIds = data?.student_ids;
            const assignedStudentCount = data?.assigned_student_data_count;

            const { data: classData } = await dataProvider.getOne('classes', {
                id: classProgress.class_id,
                meta: { scopingEscapeHatch: true, prefetch: ['teaching_modes'] }
            });
            const { data: students } = await dataProvider.getList('students', {
                filter: { id: studentIds },
                meta: { scopingEscapeHatch: true, prefetch: ['users'] },
                pagination: { page: 1, perPage: 1000 }
            });

            if (classData.status === ClassesStatus.SCHEDULED) {
                setClickedButtonId(null);
                alert(`Please start the class before assigning ${isExecutiveCoachingFlavored() ? 'executives' : 'students'}`);
            } else if (studentIds.length > 0) {
                setClickedButtonId(null);
                openDialog(
                    <AssignedStudentsDialog
                        classProgress={classProgress}
                        studentIds={studentIds}
                        students={students}
                        classData={classData}
                        assignedStudentCount={assignedStudentCount}
                    />, { width: '50vw' }
                );
            } else {
                setClickedButtonId(null);
                alert(`No ${isExecutiveCoachingFlavored() ? 'executives' : 'students'} remaining to be assign`);
            }
        } catch (error) {
            remoteLog("Error on showUnassignedStudentDialog: ", error);
            console.error("Error on showUnassignedStudentDialog: ", error);
        }
    };
    const isInProgress = dropperId === ClassProgressStatus.IN_PROGRESS;
    const isCompleted = dropperId === ClassProgressStatus.COMPLETED;
    const formattedDate = date => {
        return date ? formatDateWithShortYear(date) : 'N/A';
    };

    const getTextColor = (theme, draggableSnapshot, isBlocked) => {
        const isDarkMode = theme.palette.mode === "dark";
        const white = theme.palette.common.white;
        const black = theme.palette.common.black;
        const lightGrey = theme.palette.grey[600];
        const darkGrey = theme.palette.grey[700];
        if (isDarkMode) return white;
        if (isBlocked) return lightGrey;
        return draggableSnapshot.isDragging ? black : darkGrey;
    }

    const getAssignButtonColor = (theme, record) => {
        const isLightMode = theme.palette.mode === "light";
        const lightGrey = theme.palette.grey[400];
        const mediumGrey = theme.palette.grey[600];
        const darkGrey = theme.palette.grey[700];
        if (record.is_assigned) {
            return isLightMode ? lightGrey : darkGrey;
        } else {
            return isLightMode ? mediumGrey : lightGrey;
        }
    }

    return (
        <ResourceContextProvider value="class_progress">
            <ListContextProvider value={{ data: classProgresses, ids: classProgresses?.map(lesson => lesson.id) }}>
                <Droppable droppableId={dropperId} direction="vertical">
                    {(provided, snapshot) => {
                        const isBlocked = snapshot.isDraggingOver && snapshot.draggingFromThisWith !== null;
                        return (
                            <div
                                ref={provided.innerRef}
                                {...(!isBlocked ? provided.droppableProps : {})}
                                style={{
                                    minHeight: contentHeight,
                                    backgroundColor: isBlocked ? 'rgba(0,0,0,0.1)' : 'transparent',
                                    opacity: isBlocked ? 0.5 : 1,
                                    pointerEvents: isBlocked ? 'none' : 'auto',
                                    transition: 'background-color 0.2s ease',
                                }}
                            >
                                <DataTableWithIndex empty={<Empty showIcon={false} emptyText={emptyText} />}
                                                    bulkActionButtons={false} sx={{ '& .MuiTableCell-head': { display: 'none' }}}>
                                    <DataTable.Col label={false} render={record => (
                                        <Draggable key={record.id} draggableId={record.id.toString()} index={record.__index__}>
                                            {(provided, draggableSnapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                <div style={{display: 'flex'}}>
                                                    <Box component="div"
                                                         sx={{display: 'grid', alignItems: 'center'}}>
                                                        <Tooltip title={isInProgress ? `Started: ${formattedDate(record.start_date)}` : isCompleted ? `Completed: ${formattedDate(record.completion_date)}` : ''}>
                                                            <Typography variant="h7"
                                                                        sx={{flex: 1,
                                                                            fontSize: '0.8rem',
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            color: (theme) => getTextColor(theme, draggableSnapshot, isBlocked),
                                                                            opacity: draggableSnapshot.isDragging ? 1 : undefined,
                                                                        }}>{record.lesson?.name}</Typography></Tooltip>
                                                    </Box>
                                                    {dropperId === ClassProgressStatus.IN_PROGRESS && (
                                                        <Tooltip title="Assign">
                                                            {assignmentLoadingIds.includes(record.id) || clickedButtonId === record.id ?
                                                                <IconButton><CircularProgress size={18} /></IconButton> :
                                                                <IconButton 
                                                                    sx={{ p: '0rem', ml: '0.5rem', 
                                                                        color: (theme) => getAssignButtonColor(theme, record)
                                                                    }}
                                                                    disabled={clickedButtonId}
                                                                    onClick={(e) => handleOnClickAssignment(e, record)}><AssignmentRoundedIcon /> </IconButton>}
                                                        </Tooltip>
                                                    )}</div>
                                                </div>
                                            )}
                                        </Draggable>
                                    )} />
                                </DataTableWithIndex>
                                {!isBlocked && provided.placeholder}
                            </div>
                        )
                    }}
                </Droppable> 
            </ListContextProvider>
         </ResourceContextProvider>
    )
}
