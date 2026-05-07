import {getLocalStorage, remoteLog, setLocalStorage} from "@mahaswami/vc-frontend";
import {
    ListBase,
    ReferenceField,
    Show, Title,
    useGetRecordId,
    Loading,
    useRedirect, useSidebarState
} from "react-admin";
import React, {useEffect, useState} from "react";
import {Box, Button, Card, CardContent, CardHeader, Grid, Tooltip, Typography} from "@mui/material";
import AccordionSection from "../../components/AccordionSection.tsx";
import SchedulePreview from "./SchedulePreview.tsx";
import {isCoach, isStudent} from "../../businessLogic.ts";
import {DBCard} from "../../components/DBCard.tsx";
import DiscussionBoard from "../discussion/DiscussionBoard.tsx";
import {AssignmentList} from "./assignmentList.tsx";
import {ListTitle} from "../../components/Title.tsx";
import ParentAndStudentDashBoard from "../dashboard/ParentAndStudentDashBoard.tsx";
import {TeachingMode} from "../../helpers/constants.ts";
import {useNavigate} from "react-router-dom";
import { GameIcon } from "../games/GameIcon.tsx";

export const EnrollmentShow = () => {
    const recordId = Number(useGetRecordId());
    const [enrollment,setEnrollment] = useState(null);
    const [studentName,setStudentName] = useState(null);
    const [classRecord, setClassRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [parentId, setParentId] = useState(0);
    const [parentRecord, setParentRecord] = useState(null);
    const [isSidebarOpen, setSidebarVisibility] = useSidebarState();
    const dataProvider = window.swanAppFunctions.dataProvider;
    const isSchoolClass = classRecord?.is_school_class;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const {data: enrollmentData} = await dataProvider.getOne('enrollments', {id: recordId});
                const {data:student} = await dataProvider.getOne('students', {id: enrollmentData.student_id});
                setParentId(student?.parent_user_id)
                const {data:user} = await dataProvider.getOne('users', {id: student.user_id});
                const {data:classData} = await dataProvider.getOne('classes', {id: enrollmentData.class_id, meta: {prefetch: ['teaching_modes']}});
                const {data:assignmentsData} = await dataProvider.getList('assignments', {
                    pagination: {page: 1, perPage: 100},
                    filter: {class_id: enrollmentData.class_id, student_id: enrollmentData.student_id}});
                const {data: parentData} = await dataProvider.getList('parent_notes');
                const filteredNotes = parentData.filter(note => note.student_id === enrollmentData.student_id);
                setParentRecord(filteredNotes.length);
                setEnrollment(enrollmentData);
                setClassRecord(classData);
                setStudentName(user.fullName);
                setAssignments(assignmentsData);
                setLoading(false);
            } catch (error) {
                remoteLog("Error on fetchEnrollments in studentDashBoard: ", error);
            }
        }
        if (isSidebarOpen) {
           setSidebarVisibility(false);
        }
        fetchEnrollments();
    }, []);


   let assignmentsFilter = {
       class_id: enrollment?.class_id,
       lesson_id: undefined,
       student_id: enrollment?.student_id
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
        height: "82vh",
        maxHeight: "82vh",
        scrollbarWidth: 'none',
        overflow: 'auto',
        padding: '6px'
    });
    const isRemoteMode = classRecord && classRecord?.teaching_mode?.name === TeachingMode.REMOTE; // Remote
    if (loading) {
        return <Loading />;
    }

    if (isCoach()) {
        return (
            <>
                <Title title={<ListTitle resourceName={`${classRecord?.name} - ${studentName}` + '\'s Analytics'}/>}/>
                <ParentAndStudentDashBoard studentId={enrollment?.student_id} classRecord={classRecord} assignments={assignments} parentRecord={parentRecord} parentId={parentId} enrollmentId={recordId}/>
            </>
        )
    }

    const GameAction = () => {
        return (
            <Tooltip title={"Games"}>
                <Button startIcon={<GameIcon/>}
                    sx={{
                        color: (theme) => theme.palette.mode === "light" ? "white" : "black",
                        minWidth: 0, mt: 1
                    }}
                    onClick={() => {
                        setLocalStorage("class_game_state", {classId: classRecord?.id, backUrl: `/enrollments/${recordId}/show`});
                        navigate('/games', { state: { 
                            classId: classRecord?.id, 
                            className: classRecord?.name,
                            backUrl: `/enrollments/${recordId}/show` 
                        }});
                    }}
                />
            </Tooltip>
        )
    }

    return (
        <Show component={'div'} title={studentName + '\'s Class Workspace'} sx={{
            '& .RaShow-card': {
                height: 'calc(100vh - 70px)',
            },
            '& .RaDatagrid-root': {
                width: "100%"
            }
        }}>
            <Grid container spacing={1} sx={{height: '100%'}}>
                <Grid item xs={isRemoteMode ? 5 : 12}>
                    <Card sx={{height: '100%'}}>
                        <CardHeader title={
                            <Typography variant="h6"> {classRecord.name}</Typography>} action={<GameAction/>}sx={cardHeaderSx} />
                        <CardContent sx={cardContentSx}>
                            {(isRemoteMode && !isSchoolClass) &&
                                <AccordionSection defaultExpanded title={"Schedule"} color="LightSlateGrey">
                                    <ReferenceField reference={"classes"} source={"class_id"} link={false}>
                                        <SchedulePreview/>
                                    </ReferenceField>
                                </AccordionSection>}

                                {isRemoteMode && <AccordionSection title={isStudent() ? "My Assignments" : "Assignments"} defaultExpanded={true}  color={"LightSlateGrey"}>
                                    <ListBase resource="assignments" filter={assignmentsFilter}>
                                        <AssignmentList enrollmentId={enrollment?.id}/>
                                    </ListBase>
                                    </AccordionSection>}

                                {!isRemoteMode && <DBCard title={isStudent() ? "My Assignments" : "Assignments"}  color={"LightSlateGrey"} component={
                                    <ListBase resource="assignments" filter={assignmentsFilter} queryOptions={{meta: {prefetch: ['students']}}}>
                                        <AssignmentList enrollmentId={enrollment?.id}/>
                                    </ListBase>
                                }>
                                </DBCard>}
                        </CardContent>
                    </Card>

                </Grid>
                {isRemoteMode && <Grid item xs={7}>
                    <DiscussionBoard references={{
                        ref1: {
                            id: enrollment?.class_id,
                            name: "class_id"
                        }
                    }}/>
                </Grid>}
            </Grid>
        </Show>
    )};