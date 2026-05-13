import React from 'react';
import {Grid,Box,Chip,LinearProgress,Avatar,Button,Typography} from "@mui/material";
import {useState,useEffect} from "react";
import {Card} from "@mui/material";
import {ResourceContextProvider,Link,useDataProvider,TextField,ReferenceField,List,Datagrid,SimpleList,ImageField,DateField,FunctionField,WithListContext, useRedirect, Loading} from "react-admin";
import {CardWithIcon} from "../../components/CardWithIcon";
import {CardWithBGIconOnRight} from "../../components/CardWithIcon";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import {getCurrentUserStudentId} from "../../businessLogic";
import {ReferenceArea} from "recharts";
import {DBCard} from "../../components/DBCard";
import {ActivityHoursChart} from "../../components/ActivityHoursChart";
import {formatStatus} from "../../utils";
import StackedProgressBar from "../../components/StackedProgressBar";
import {remoteLog, setLocalStorage} from "@mahaswami/vc-frontend";
import {AssignmentStatus, ClassesStatus, CertificateStatus, TrophiesStatus} from "../../helpers/constants.ts";
import {SwanView} from "../swan_crud/SwanCrud.tsx";

export const Studentmaindashboard = () =>{
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [studentId, setStudentId] = useState(0);
    const [activeClassesCount, setActiveClassesCount] = useState(0);
    const [completedClassesCount,setCompletedClassesCount] = useState(0);
    const [certificatesCount, setCertificatesCount] = useState("");
    const [trophiesCount,setTrophiesCount] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const redirect = useRedirect();

    useEffect(() => {

        const fetchCounts = async () => {
            try {
                const studentId = await getCurrentUserStudentId(dataProvider);
                setStudentId(studentId);

                const {data:enrollments} = await dataProvider.getList('enrollments', {
                    filter: {student_id: studentId}
                });
                const classIds = enrollments.map(enrollment => enrollment.class_id);
                getClassStatusCount(classIds).then((classCount) => {
                    setActiveClassesCount(classCount.activeCount);
                    setCompletedClassesCount(classCount.completeCount);
                })
                const certificatesCount = await dataProvider.getList('certificates', {
                    filter: {student_id: studentId, status: CertificateStatus.ISSUED}
                });
                setCertificatesCount(certificatesCount.data.length);
                const trophiesCount = await dataProvider.getList('trophies', {
                    filter: {student_id: studentId,status: TrophiesStatus.ISSUED}
                });
                setTrophiesCount(trophiesCount.data.length);
                setLoading(false);
            } catch (error) {
                remoteLog("Error sending on Studentmaindashboard fetchCounts method: ", error);
            }
        }
        const fetchAssignments = async () => {
            try {
                //TODO Refactor this avoid code duplication
                const studentId = await getCurrentUserStudentId(dataProvider);
                const {data:assignments} = await dataProvider.getList('assignments', {
                    pagination: {page: 1, perPage: 100},
                    sort: {field: 'id', order: 'ASC'},
                    filter: {student_id: studentId,}
                });
                //Group assignments by curriculumn_lesson_id. For each curriculum_lesson_id, count the number of assignments in each status
                const groupedAssignments = {};
                assignments.forEach(assignment => {
                    if (!groupedAssignments[assignment.lesson_id]) {
                        groupedAssignments[assignment.lesson_id] = {
                            completed: 0,
                            in_progress: 0,
                            not_started: 0
                        };
                    }
                    if (assignment.status === AssignmentStatus.COMPLETED) {
                        groupedAssignments[assignment.lesson_id].completed++;
                    } else if (assignment.status === AssignmentStatus.IN_PROGRESS) {
                        groupedAssignments[assignment.lesson_id].in_progress++;
                    } else {
                        groupedAssignments[assignment.lesson_id].not_started++;
                    }
                });
                //Set the lesson name in groupedAssignments
                for (const lessonId of Object.keys(groupedAssignments)) {

                    const {data:lesson} = await dataProvider.getOne('lessons', {
                        id: lessonId
                    });
                    groupedAssignments[lessonId].lesson = lesson.name;
                    groupedAssignments[lessonId].id = lessonId;
                }
                setAssignments(Object.values(groupedAssignments));
            } catch (error) {
                remoteLog("Error sending on Studentmaindashboard fetchAssignments method: ", error);
            }
        }

        fetchCounts();
        fetchAssignments();
        setLoading(false);
    }, []);

    const getClassStatusCount = async (classIds: any) => {
        try {
            let completeCount = 0;
            let activeCount = 0;
            const {data: enrollmentClasses} = await dataProvider.getList('classes', {
                filter: {id: [...classIds]},
            });
            await Promise.all(
                enrollmentClasses.map(async (classData: any) => {
                    if (classData?.teaching_mode_id) {
                        const {data: teachingMode} = await dataProvider.getOne('teaching_modes', {
                            id: classData.teaching_mode_id,
                        });

                        if (teachingMode.name !== 'In Person') {
                            if (classData.status === ClassesStatus.ACTIVE) {
                                activeCount++;
                            } else if (classData.status === ClassesStatus.COMPLETED) {
                                completeCount++;
                            }
                        }
                    }
                })
            );
            return {activeCount, completeCount};
        } catch (error) {
            remoteLog("Error sending on Studentmaindashboard getClassStatusCount method: ", error);
        }
    }

    const handleAssignmentOnClick = (id: any) => {
        const assignment = assignments.find((a: any) => String(a.lesson_id) === String(id));
        redirect(`/lessons/${id}/show?assignment=${assignment.id}`);
        return false;
    }

    if(loading) return <Loading/>;
    return(
        <SwanView>
            <Grid container spacing={2} style={{padding: "12px"}}>
                <Grid item xs={12}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 2, marginBottom: 3}}>
                        {/* First Row (Two Cards) */}
                        <Box sx={{display: "flex", gap: 2}}>
                            <CardWithBGIconOnRight Icon={CastForEducationIcon} title="Active Classes" count={activeClassesCount !== null ?  activeClassesCount : "0"}
                                                   color={"blue"}/>
                            <CardWithBGIconOnRight Icon={CastForEducationIcon} title="Completed Classes" count={completedClassesCount !== null ? completedClassesCount: "0"}
                                          color={"green"}/>
                            <CardWithBGIconOnRight Icon={WorkspacePremiumIcon} title="Certificates" count={certificatesCount !== null ? certificatesCount : "0"}
                                                   color={"blue"}/>
                            <CardWithBGIconOnRight Icon={WorkspacePremiumIcon} title="Trophies" count={trophiesCount !== null ? trophiesCount : "0"}
                                                   color={"blue"}/>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 2, marginBottom: 3}}>
                        <ResourceContextProvider value="enrollments">
                            <List title=" " filter={{student_id:studentId}} exporter={false} queryOptions={{meta: {prefetch: ['classes']}}} actions={false} perPage={2} pagination={false} sx={{'& .RaList-content': {
                                    boxShadow: '0px 0px 0px 0px',
                                },}}>
                                <DBCard cardHeight={380} component={

                                <Datagrid pending={false} header={<></>}  bulkActionButtons={false} empty={false}>
                                 {/*   <ReferenceField source="class_id" reference="classes" link={false}>
                                        <ReferenceField source="curriculum_id" reference="curriculum" link={false}>
                                            <ImageField source="image_file_id" src="src" sx={{'& .RaImageField-image': { width:'100%',height:100,objectFit: 'contain' }}}/>
                                        </ReferenceField>
                                    </ReferenceField>*/}
                                    {/*<Box sx={{ display:'flex',flexDirection:'column', width: '100%',marginTop:2 }}>*/}
                                    <ReferenceField source="class_id" reference="classes" link={false}>
                                        {/*<ReferenceField source="curriculum_id" reference="curriculum" link={false}>*/}
                                            <TextField source="name" sx={{ fontSize: '20px', paddingRight:2}}/>
                                        {/*</ReferenceField>*/}
                                    </ReferenceField>
                                        {/*<Box sx={{ display:'flex',flexDirection:'row', width: '100%', justifyContent:'center',alignItems:'center' }}>*/}
                                            <ReferenceField source="class_id" reference="classes">
                                                <ReferenceField source="coach_id" reference="coaches">
                                                    <ReferenceField source="user_id" reference="users" >
                                                        <Avatar>
                                                            <ImageField source="image_file_id" src="src"/>
                                                        </Avatar>
                                                    </ReferenceField>
                                                </ReferenceField>
                                            </ReferenceField>
                                            <ReferenceField source="class_id" reference="classes" link={false}>
                                                <ReferenceField source="coach_id" reference="coaches" link={false}>
                                                    <ReferenceField source="user_id" reference="users" link={false}>
                                                        <TextField source="fullName" sx={{paddingLeft:1}}/>
                                                    </ReferenceField>
                                                </ReferenceField>
                                            </ReferenceField>
                                        {/*</Box>*/}
                                    {/*</Box>*/}
                                    <FunctionField render={record =><>
                                        <Box sx={{ display:'flex',flexDirection:'column', width: '100%' }}>
                                        <Chip label={formatStatus(record.class.status)}
                                              color={record.class.status === ClassesStatus.COMPLETED ? 'success' : record.class.status === ClassesStatus.ACTIVE ? 'info' : 'warning'}>  </Chip>
                                        </Box>
                                    </>
                                    } />
                                </Datagrid>
                            } title={"My Classes"} color={"blue"} footer={
                        <WithListContext render={({isPending,total}) => (
                            !isPending &&  <Button
                            sx={{ borderRadius: 0, padding:2,fontSize:"18px" }}
                            component={Link}
                            to={{
                                pathname: '/enrollments',
                                search: `filter=${JSON.stringify({ student_id: studentId })}&sort=date&order=ASC`,
                            }}
                            size="small"
                            color="primary"
                        >
                            View All
                        </Button>)} />}>

                    </DBCard> </List>
                        </ResourceContextProvider>

                    </Box>
                </Grid>

              {/*  <Grid item xs={6}>
                    <ActivityHoursChart/>
                </Grid>*/}
                <Grid item xs={6}>
                    <DBCard cardHeight={380} component={ <List title={" "} resource={"assignments"} exporter={false} actions={false} perPage={5} pagination={false} sx={{'& .RaList-content': {
                            boxShadow: '0px 0px 0px 0px',
                        },}} filter={{student_id:studentId}} sort={{field:'status',order:'desc'}}>
                        <Box sx={{padding:1}}>
                        <Datagrid resource="lessons" header={<></>} bulkActionButtons={false} data={assignments} rowClick={handleAssignmentOnClick}>
                        {/*<ReferenceField source="curriculum_lesson_id" reference="curriculum_lessons" link={false}>}
                            <ReferenceField source="lesson_id" reference={"lessons"} link={false}>
                                <TextField variant="h7" source={"name"} />
                            </ReferenceField>
                        </ReferenceField>*/}
                            <TextField variant="h7" source={"lesson"} label={"lesson"}/>
                            <FunctionField label="Status" render={record => {
                                const total = record.completed + record.in_progress + record.not_started;

                                if (total === record.completed) {
                                    return  <Typography sx={{fontSize:'small'}}>Completed</Typography>
                                }
                                else if(total === record.not_started){
                                    return <Typography sx={{fontSize:'small'}}>Not Started</Typography>
                                }
                                else
                                    return <Typography sx={{fontSize:'small'}}>In Progress</Typography>
                            }}/>
                            <FunctionField label="Progress" render={record => {
                                const total = record.completed + record.in_progress + record.not_started;
                                const completed = (record.completed) / total * 100;
                                /* return (<><LinearProgress variant="determinate" value={completed} valueBuffer={(record.total - record.completed)*100} color={'success'} />
                                   <Typography sx={{fontSize:'small'}}> {record.completed} out of {total} completed</Typography></>);*/
                                const progressValues = [
                                    {label: 'Completed', value: record.completed, percent: (record.completed) / total * 100, color: 'success'},
                                    {label: 'In Progress', value: record.in_progress,percent: (record.in_progress) / total * 100, color: 'info'},
                                    {label: 'Not Started', value: record.not_started, percent: (record.not_started) / total * 100, color: 'warning'}
                                ];
                                return (<>
                                        <StackedProgressBar progressValues={progressValues}/>
                                        <Typography sx={{fontSize:'small',paddingTop:2}}> {record.completed} out of {total} completed</Typography>
                                    </>
                                );
                            }} />
                    </Datagrid></Box>
                    </List>} title={"My Assignments"} color={'blue'} footer={
                        assignments.length > 0 && <Button
                        sx={{ borderRadius: 0, padding:1,fontSize:"18px" }}
                        component={Link}
                        to={{
                        pathname: '/assignments',
                        search: `filter=${JSON.stringify({ student_id: studentId })}&sort=date&order=ASC`,
                    }}
                        size="small"
                        color="primary"
                        >
                        View All
                        </Button>} />
                </Grid>
            </Grid>
        </SwanView>
    )
}