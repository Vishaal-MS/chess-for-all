import {
    Button,
    EditButton, FunctionField, ImageField, Loading, ReferenceField,
    ReferenceManyCount,
    ReferenceManyField,
    SimpleList,
    useGetRecordId,
    useNotify,
    useRefresh, useSidebarState
} from "react-admin";
import React, {useEffect, useState} from "react";
import {Avatar, Box, Card, CardContent, CardHeader, Grid, Stack, Tooltip, Typography} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import {ClassLessons} from "./classLessons.tsx";
import AccordionSection from "../../components/AccordionSection.tsx";
import SchedulePreview from "./SchedulePreview.tsx";
import {Empty} from "../common/empty.tsx";
import DiscussionBoard from "../discussion/DiscussionBoard.tsx";
import {ClassesStatus, TeachingMode} from "../../helpers/constants.ts";
import {RecordTitle} from "../../components/Title.tsx";
import StopCircleIcon from '@mui/icons-material/StopCircle';
import {isExecutiveCoachingFlavored, isRegularSchoolFlavored, isSchoolStandardLinked} from "../../businessLogic.ts";
import {remoteLog, setLocalStorage} from "@mahaswami/vc-frontend";
import { AvatarField } from "../../fields/AvatarField.tsx";
import { SwanShow } from "../swan_crud/SwanCrud.tsx";
import {useNavigate} from "react-router-dom";
import { GameIcon } from "../games/GameIcon.tsx";

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

export const MyClassShow = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const recordId = Number(useGetRecordId());
    const notify = useNotify();
    const refresh= useRefresh();
    const [classRecord,setClassRecord] = useState({});
    const [sideBarOpen, setSidebarOpen] = useSidebarState();
    const [loading, setLoading] = useState(true);
    const isRemoteTeachMode: boolean = classRecord?.teaching_mode?.name === TeachingMode.REMOTE;
    const navigate = useNavigate();
    const [showGamesMenu, setShowGamesMenu] = useState(false);
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const isSchoolClass = classRecord?.is_school_class;

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const {data: classRecord, isPending} = await dataProvider.getOne('classes', {
                    id: recordId,
                    meta: {prefetch: ['teaching_modes']}
                });
                setClassRecord(classRecord);
                setLoading(isPending);
            } catch (error) {
                remoteLog("Error on fetchClass in classDashboard: ", error);
            }
        }
        if (sideBarOpen) {
           setSidebarOpen(false);
        }
        fetchClass();
    },[]);


    const updateClassStatus = async (status) => {
        if (status === ClassesStatus.COMPLETED) {
            classRecord.end_date = new Date();
        }
        classRecord.status = status;
        await dataProvider.update('classes', {
            id: recordId,
            data: {...classRecord}
        });
        notify('Class marked as ' + status, {type: 'success'});
        refresh();
    }

    const ClassShowActions = () => (
        <Stack direction={"row"} spacing={-1} sx={{marginTop: '0.5rem'}}>
            <Button
                title="Games" startIcon={<GameIcon sx={{fontSize : "1.5rem !important"}}/>}
                sx={{color: (theme) => theme.palette.mode === "light" ? "white" : "black", minWidth: 0}}
                onClick={() => {
                    setLocalStorage("class_game_state", {classId: classRecord?.id, backUrl: `/classes/${classRecord?.id}/show`})
                    navigate('/games', { state: { 
                        classId: classRecord?.id, 
                        className: classRecord?.name,
                        backUrl: `/classes/${classRecord?.id}/show` 
                    }});
                }}
            />
            {classRecord.status === ClassesStatus.ACTIVE &&
                <Button  title="Mark As Stop"  color="error"
                         sx={{color: (theme) =>  theme.palette.mode === "light" ? "white" : "black", minWidth: 0}}
                         startIcon={<StopCircleIcon sx={{fontSize : "1.5rem !important"}}/>}
                         onClick={()=>{
                             if(confirm("Are you sure you want to stop the class?")) {
                                 updateClassStatus(ClassesStatus.COMPLETED)
                             }
                         }}></Button>}
            {classRecord.status === ClassesStatus.COMPLETED &&
                <Button sx={{'&.Mui-disabled': {color: (theme) =>  theme.palette.mode === "light" ? "white" : "black", minWidth: 0}}}
                        startIcon={<CheckCircleRoundedIcon sx={{fontSize : "1.5rem !important"}}/>} disabled />}
            {classRecord.status === ClassesStatus.SCHEDULED &&
                <Button title="Mark As Started" color="warning"
                        sx={{color: (theme) => theme.palette.mode === "light" ? "white" : "black", minWidth: 0}}
                        startIcon={<PlayCircleFilledRoundedIcon sx={{fontSize : "1.5rem !important"}}/>}
                        onClick={()=>{updateClassStatus(ClassesStatus.ACTIVE)}}></Button>}
            <EditButton label={""} color={"warning"}
                        sx={{color: (theme) => theme.palette.mode === "light" ? "white" : "black", minWidth: 0, '& .MuiSvgIcon-root': {fontSize: '1.5rem'}}} title={"Edit"} />
        </Stack>
    )

    if (loading) return <Loading />;
    
    return (
        <SwanShow title={<RecordTitle resourceName={`${isRegularSchoolFlavored() ? 'Teacher' : 'Coach'} Workspace`}/>} component={'div'} actions={false} sx={{
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
                            {!isSchoolClass && <AccordionSection defaultExpanded title={"Schedule"} color="LightSlateGrey">
                                <SchedulePreview />
                            </AccordionSection>}
                            <AccordionSection contentHeight={isSchoolClass ? "calc(100vh - 9.45rem)" : undefined} defaultExpanded title={isExecutiveCoachingFlavor ? "Executives" : "Students"} color="LightSlateGrey"
                                              count={<ReferenceManyCount fontWeight="bold" reference="enrollments" target="class_id" />}>
                                <ReferenceManyField
                                    reference="enrollments"
                                    target="class_id"
                                    link={false}
                                    perPage={1000}
                                >
                                    <SimpleList
                                        rowSx={() => ({
                                            paddingInline: "0.3rem",
                                            overflow: "hidden",
                                            '& .MuiListItemAvatar-root': {
                                                minWidth: 'auto', // Removes default min-width that causes space
                                                marginRight: '0.5rem', // Optional: fine-tune spacing
                                            },
                                            '& .MuiAvatar-circular': {
                                                height: "2rem",
                                                width: "2rem",
                                                fontSize: "1rem"
                                            }
                                        })}
                                        empty={<Empty showIcon={false} emptyText={`No ${isExecutiveCoachingFlavor ? 'executive' : 'students'} added yet`}/>}
                                        primaryText={() => (
                                            <Stack direction="row" spacing={1} sx={{width: '100%', alignItems: 'center', flexWrap: 'nowrap'}}>
                                                <Box sx={{maxWidth: '80%', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                                    <ReferenceField source="student_id" reference="students" link={false}>
                                                        <ReferenceField source="user_id" reference="users" link={false}>
                                                            <FunctionField render={(record) => (
                                                                <Tooltip title={record.fullName}>
                                                                    <Typography sx={{
                                                                            fontSize: '0.85rem',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                    >
                                                                        {record.fullName}
                                                                    </Typography>
                                                                </Tooltip>
                                                            )}/>
                                                        </ReferenceField>
                                                    </ReferenceField>
                                                </Box>
                                                <ReferenceField
                                                    reference="students"
                                                    source="student_id"
                                                    link={false}
                                                    sx={{ minWidth: '20%', overflow: 'hidden', marginTop: '0.25rem !important' }}
                                                >
                                                    <FunctionField
                                                        render={(student) => {
                                                            const studentTooltipContent = [
                                                                student?.grade?.trim() ? `Grade: ${student.grade}` : '',
                                                                student?.emergency_contact ? ` Emergency Contact: ${student.emergency_contact}` : '',
                                                                student?.method_of_going_home?.trim() && !isRemoteTeachMode ? ` Method of going home: ${student.method_of_going_home}` : ''
                                                            ].filter(item => item !== "")
                                                            const studentShortText = [
                                                                (student?.grade?.trim() ? `${student.grade}` : ''),
                                                                (student?.emergency_contact ? ` ${student.emergency_contact}` : ''),
                                                                (student?.method_of_going_home?.trim() && !isRemoteTeachMode ? ` ${student.method_of_going_home}  ` : '')
                                                            ].filter(item => item !== "")
                                                            const tooltipContent = studentTooltipContent.join(" /")
                                                            const shortText = studentShortText.join(" /")
                                                            return (
                                                                <Tooltip title={tooltipContent}>
                                                                    <Box sx={{
                                                                            width: '100%',
                                                                            minWidth: 0,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                fontSize: '0.65rem',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap',
                                                                            }}
                                                                        >
                                                                            {shortText}
                                                                        </Typography>
                                                                    </Box>
                                                                </Tooltip>
                                                            );
                                                        }}
                                                    />
                                                </ReferenceField>
                                            </Stack>
                                        )}
                                        leftAvatar={() => (
                                            <ReferenceField source="student_id" reference="students" link={false}>
                                                <ReferenceField source="user_id" reference="users" link={false}>
                                                    <AvatarField />
                                                </ReferenceField>
                                            </ReferenceField>
                                        )}
                                        sx={{
                                            paddingTop: 0,
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
                        <DiscussionBoard references={{
                            ref1: {
                                id: classRecord?.id,
                                name: "class_id"
                            }
                        }}/>
                    </Grid>
                }
            </Grid>
        </SwanShow>
    )
};