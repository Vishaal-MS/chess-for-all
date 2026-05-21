import {
    Button, Create, List, useNotify, WrapperField,
} from "react-admin";
import {FunctionField, TextField, useSidebarState} from "react-admin";
import {Box, Card, CardContent, CardHeader, Grid, IconButton, Typography, Tooltip} from "@mui/material";
import {formatDateWithShortYear, formatStatus} from "../../utils.ts";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip as TooltipRechart} from "recharts";
import {useEffect, useState} from "react";
import {isCoach} from "../../businessLogic.ts";
import ParentNoteList, {ParentNoteCreate, ParentNotesForm} from "../parent_notes/parentNotes.tsx";
import {AssignmentStatus} from "../../helpers/constants.ts";
import AddIcon from "@mui/icons-material/Add";
import {closeDialog, DataTable, openDialog, remoteLog, setLocalStorage} from "@mahaswami/vc-frontend";
import {Empty} from "../common/empty"
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import {useLocation, useNavigate} from "react-router-dom";
import {StudentProgressField} from "../class/assignmentList.tsx";
import TimeField from "../../fields/TimeField.tsx";
import { Stars } from "@mui/icons-material";
import {GameIcon} from "../games/GameIcon.tsx";

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
    paddingBottom: '1px !important',
    paddingTop: '4px !important',
});

const ParentAndStudentDashBoard = ({studentId, classRecord, parentId, assignments, parentRecord, enrollmentId}) => {
    const [thisWeekData, setThisWeekData] = useState([{name:'',count:0}]);
    const [last12WeekData, setLast12WeekData] = useState([{name: '', count: 0 }]);
    const [sideBarOpen, setSidebarOpen] = useSidebarState();
    const [studentRecord, setStudentRecord] = useState(null);

    useEffect(() => {
        const fetchStudentRecord = async () => {
            try {
                const dataProvider = window.swanAppFunctions.dataProvider;
                const {data: studentData} = await dataProvider.getOne('students', {id: studentId, meta: {prefetch: ['users']}});
                setStudentRecord(studentData);
            } catch (error) {
                remoteLog("Error sending on ParentAndStudentDashBoard fetchStudentRecord method: ", error);
            }
        }
        fetchStudentRecord();
    }, []);

    useEffect(() => {
        if (sideBarOpen) {
           setSidebarOpen(false);
        }
        getLastOneWeekAssignmentCountByDay(assignments, setThisWeekData, 'completed_date');
        getLast12WeekAssignmentCountByWeek(assignments, setLast12WeekData, 'completed_date');
    }, [assignments]);

    const ParentNoteCreate = (props: any) => {
        const notify = useNotify();
        const onSuccess = () => {
            closeDialog();
            notify(`Parent note added successfully`, {type: 'success'});
        }
        return (
            <Create
                redirect={false}
                resource="parent_notes"
                mutationOptions={{
                    onSuccess: () => onSuccess()
                }}>
                <ParentNotesForm {...props}/>
            </Create>
        );
    }
    const onAddParentNoteClick = () => {
        openDialog(<ParentNoteCreate
            defaultValues={{
                parent_user_id: parentId,
                class_id: classRecord?.id,
                coach_id: classRecord?.coach_id,
                student_id: studentId,
                created_date: new Date()
            }}/>
        );
    };
    const isIntegratedParentalEngagement =  studentRecord?.is_integrated_parental_engagement
    const navigate = useNavigate();
    const location = useLocation();
    const lastLoggedInDate = studentRecord?.user?.last_login_date ? formatDateWithShortYear(studentRecord.user.last_login_date) : 'Not yet';

    const handleBackToClass = () => {
        if (location.state) {
            const {from, gradeId, dateRange, dateRange2, isCompare, clientValue, fromDate1, toDate1, fromDate2, toDate2, previousState} = location.state.data || null;
            if (from === 'board_report') {
                navigate('/performance_report', {state: {gradeId, dateRange, clientValue, fromDate1, toDate1, fromDate2, toDate2, dateRange2, isCompare, previousState}});
            }
        } else {
            navigate(`/classes/${classRecord?.id}/show`)
        }
    }

    const handleAssignmentRowClick = (id, _resource, record) => {
        navigate(`/lessons/${record.lesson.id}/show`, { state: { 
            assignmentId: record.id,
            title: "Enrollments"
        }});
        return false;
    }

    return (
        <>
           {assignments.length === 0 && parentRecord === 0  ?  <p style={{textAlign : 'center' , marginTop : '20em'}}> Data is not available yet </p>  :
               <Grid container direction="row" spacing={1} sx={{paddingTop:1}}>
                <Grid item xs={12} md={6}>
                    <Box sx={{height: '100%'}}>
                        <Card sx={{height: isIntegratedParentalEngagement ? '50%' : '100%'}}>
                            <CardHeader sx={cardHeaderSx}
                                        avatar={
                                            isCoach() && (
                                                <Button
                                                    onClick={handleBackToClass}
                                                    style={{color: 'white'}}
                                                    startIcon={<KeyboardReturnIcon/>}
                                                />
                                            )
                                        }
                                        action={
                                            isCoach() && (
                                                <Button
                                                    title="Games" startIcon={<GameIcon sx={{fontSize : "1.5rem !important"}}/>}
                                                    sx={{color: (theme) => theme.palette.mode === "light" ? "white" : "black", minWidth: 0, mt: "0.5rem"}}
                                                    onClick={() => {
                                                        setLocalStorage("class_game_state", {
                                                            classId: classRecord?.id,
                                                            enrollmentId: enrollmentId,
                                                            student_id: studentId,
                                                            backUrl: `/enrollments/${enrollmentId}/show`}
                                                        )
                                                        navigate('/games', { state: {
                                                                enrollmentId: enrollmentId,
                                                                classId: classRecord?.id,
                                                                className: classRecord?.name,
                                                                student_id: studentId,
                                                                backUrl: `/enrollments/${enrollmentId}/show`
                                                            }});
                                                    }}
                                                />
                                            )
                                        }
                                        title={
                                        <>
                                            <Typography variant="h6">
                                                {isCoach() && 'Class '} Assignments <span style={{fontSize: '0.9rem'}}>Last Logged on: {lastLoggedInDate}</span>
                                            </Typography>
                                        </>
                            }/>
                            <CardContent sx={{maxHeight: isIntegratedParentalEngagement ? 'calc(70vh - 16rem)' : '100%', overflow: 'auto', padding: '0px',scrollbarWidth: 'none'}}>
                                <List actions={false} resource="assignments" exporter={false} perPage={1000} empty={<Empty showIcon={false} emptyText={"No Assignments yet"}/>}
                                          filter={{student_id: studentId, class_id: classRecord?.id || null}} pagination={false}
                                          queryOptions={{meta: {prefetch: ['lessons', 'classes']}}} title={false}>
                                    <DataTable bulkActionButtons={false} rowClick={handleAssignmentRowClick}>
                                        <DataTable.Col label="Lesson" render={(record) => {
                                            return (<Box display={"flex"} alignItems={"center"}> 
                                                <TextField sx={{fontSize:'0.8rem' }} label="Lesson" source="lesson.name"/>
                                                {!isCoach() &&
                                                    <>  {' - '}
                                                        <TextField sx={{color: 'gray', fontSize: '0.8rem'}} source={"class.name"}/>
                                                    </>
                                                }</Box>)
                                        }}/>
                                        <DataTable.Col style={{fontSize: '0.8rem'}} source={"is_assessment"} label="" render={record => record.is_assessment && <Stars sx={{ color: theme => theme.palette.info.light }}/>}/>
                                        <DataTable.Col style={{fontSize: '0.8rem'}} source={"status"} label="Status" render={record => formatStatus(record.status)}/>
                                        <WrapperField label="Progress">
                                            <StudentProgressField/>
                                        </WrapperField>
                                        <DataTable.Col label={"Date"} render={(recode) => {
                                            return (<div>
                                                <div style={{display: 'flex', marginBottom: '0.1rem'}}>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        width: '5.1rem',
                                                        display: 'inline-block'
                                                    }}>Assigned:</span>
                                                    <span
                                                        style={{fontSize: '0.8rem'}}>{formatDateWithShortYear(recode.assigned_timestamp)}</span>
                                                </div>
                                                {recode.status === AssignmentStatus.COMPLETED &&
                                                    <div style={{display: 'flex', marginBottom: '0.1rem'}}>
                                                        <span style={{
                                                            fontSize: '0.8rem',
                                                            width: '5.1rem',
                                                            display: 'inline-block'
                                                        }}>Completed:</span>
                                                        <span
                                                            style={{fontSize: '0.8rem'}}>{formatDateWithShortYear(recode.completed_date)}</span>
                                                    </div>}
                                                {recode.status === AssignmentStatus.IN_PROGRESS && <div style={{display: 'flex'}}>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        width: '5.1rem',
                                                        display: 'inline-block'
                                                    }}>Accessed on:</span>
                                                    <span
                                                        style={{fontSize: '0.8rem'}}>{formatDateWithShortYear(recode.last_accessed_date)}</span>
                                                </div>}
                                                {recode.time_spent && recode.time_spent > 0 && <div style={{display: 'flex'}}>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        width: '5.1rem',
                                                        display: 'inline-block'
                                                    }}>Time Spent:</span>
                                                    <TimeField source="time_spent" record={recode} sx={{fontSize: '0.8rem'}}/>
                                                </div>}
                                            </div>)
                                        }}/>
                                    </DataTable>
                                </List>
                            </CardContent>
                        </Card>
                        {isIntegratedParentalEngagement && <Card sx={{height: '49.3%', marginTop: '1%'}}>
                            <CardHeader sx={cardHeaderSx}
                                        title={<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1}}>
                                            <Typography variant="h6">Parent Notes</Typography>
                                            {isCoach() && (
                                                <Tooltip title="Create Parent Note">
                                                    <IconButton
                                                        onClick={onAddParentNoteClick}
                                                        aria-label="Create Parent Note"
                                                        sx={{ color: 'white' }}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}</Box>}>
                            </CardHeader>
                            <CardContent sx={{maxHeight: 'calc(68vh - 200px)', overflow: 'auto', padding: '0px', scrollbarWidth: 'none'}}>
                                <ParentNoteList classId={classRecord?.id} parentId={parentId}
                                                coachId={classRecord?.coach_id} studentId={studentId}/>

                            </CardContent>
                        </Card>}
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{height: '100%'}}>
                        <CardHeader sx={cardHeaderSx} title={<Typography variant="h6"> Assignment Analytics</Typography>} />
                        <CardContent sx={cardContentSx}>
                            <ResponsiveContainer width="100%" height={'50%'}>
                                <BarChart width={410} height={400} data={thisWeekData}
                                          margin={{top: 10, right: 0, left: 0, bottom: 0}}>
                                    <XAxis dataKey="name" stroke="#8884d8" padding={{left: 0, right: 0}} angle={-40}
                                           textAnchor="end"/>
                                    <YAxis ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}/>
                                    <TooltipRechart wrapperStyle={{width: 100, backgroundColor: '#ccc'}}/>
                                    <Legend width={100} wrapperStyle={{
                                        top: 40,
                                        right: 20,
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #d5d5d5',
                                        borderRadius: 3,
                                        lineHeight: '40px'
                                    }}/>
                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5"/>
                                    <Bar dataKey="count" fill="#8884d8" barSize={30}/>
                                </BarChart>
                            </ResponsiveContainer>

                            <ResponsiveContainer width="100%" height={'50%'}>
                                <BarChart width={420} height={400} data={last12WeekData}
                                          margin={{top: 10, right: 0, bottom: 0}}>
                                    <XAxis dataKey="name" stroke="#8884d8" angle={-45} textAnchor="end"/>
                                    <YAxis ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} domain={[0.5, 3]}/>
                                    <TooltipRechart wrapperStyle={{width: 100, backgroundColor: '#ccc'}}/>
                                    <Legend width={100} wrapperStyle={{
                                        top: 40,
                                        right: 20,
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #d5d5d5',
                                        borderRadius: 3,
                                        lineHeight: '40px'
                                    }}/>
                                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5"/>
                                    <Bar dataKey="count" fill="#8884d8" barSize={25}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
           }
        </>
    )
}

export default ParentAndStudentDashBoard;

export const getLastOneWeekAssignmentCountByDay = (assignments, setThisWeekData, dateKey) => {
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCounts = {Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0};
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    assignments.forEach((assignment) => {
        const assignment_date = new Date(assignment[dateKey]);
        if(assignment_date >= weekAgo && assignment_date <= today) {
            const day = dayMap[assignment_date.getDay()];
            if (day) {
                dayCounts[day] += 1;
            }
        }
    })
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const day = dayMap[date.getDay()];
        let name = day;
        if(i === 0) {
            name = "Today";
        } else if (i === 1) {
            name = "Yesterday";
        }
        result.push({ name, count: dayCounts[day], title: `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear().toString().slice(-2)}` });
    }
    setThisWeekData(result);
}

export const getLast12WeekAssignmentCountByWeek = (assignments, setLast12WeekData, dateKey) => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentEndDate = new Date(today);
    for (let i = 0; i < 12; i++) {
        const endDate = new Date(currentEndDate);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);

        const count = assignments.filter((assignment) => {
            const completedDate = new Date(assignment[dateKey]);
            completedDate.setHours(0, 0, 0, 0);
            return completedDate >= startDate && completedDate <= endDate;
        }).length
        const format = (date) =>
            `${String(date.getDate()).padStart(2, '0')}/${
                String(date.getMonth() + 1).padStart(2, '0')
            }/${date.getFullYear().toString().slice(-2)}`;
        if(i === 0) {
            result.push({ name: `This week`, count: count, title: `${format(startDate)} - ${format(endDate)}`})
        } else if(i === 1) {
            result.push({ name: `Last week`, count: count, title: `${format(startDate)} - ${format(endDate)}`})
        } else {
            result.push({ name: `Week ${12-i}`, count: count, title: `${format(startDate)} - ${format(endDate)}`})
        }
        currentEndDate.setDate(currentEndDate.getDate() - 7);
    }
    result.reverse();
    setLast12WeekData(result);
}
