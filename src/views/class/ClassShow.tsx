import {
    Button,
    EditButton, FunctionField, ImageField, Link,
    ReferenceManyCount,
    ReferenceManyField,
    Show, SimpleList,
    useGetRecordId,
    useNotify,
    useRefresh, WithListContext
} from "react-admin";
import {useEffect, useState} from "react";
import {Avatar, Box, Card, CardContent, CardHeader, Grid, Stack, Tooltip, Typography} from "@mui/material";
import {ClassesStatus} from "../../helpers/constants.ts";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import {showDefaults} from "@mahaswami/vc-frontend";
import {RecordTitle} from "../../components/Title.tsx";
import {isOrgCoach, isProCoach, isStudent} from "../../businessLogic.ts";
import {ClassLessons} from "./classLessons.tsx";
import AccordionSection from "../../components/AccordionSection.tsx";
import SchedulePreview from "./SchedulePreview.tsx";
import {StudentsReferenceField} from "../students.tsx";

export const MyClassShow = (props: any) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const recordId = Number(useGetRecordId());
    const notify = useNotify();
    const refresh= useRefresh();
    const [classRecord,setClassRecord] = useState({});

    const cardContentSx = () => ({
        height: "calc(100vh - 110px)",
        scrollbarWidth: 'none',
        overflow: 'auto',
        padding: '6px',
    });

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