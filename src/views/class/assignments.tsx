import {RecordContextProvider, SelectInput, WithRecord} from 'react-admin';
import {useLayoutEffect, useRef, useState} from 'react';
import useActiveTimeTracker from '../common/useActiveTimeTracker.ts';
import {removeLocalStorage, setLocalStorage} from '@mahaswami/vc-frontend';
import {VolumeOff, VolumeUp, Stars } from "@mui/icons-material";
import { ChessAIField } from '../../fields/ai_lesson/ChessAIField';
import {Box, Button, IconButton, Paper, Tooltip} from "@mui/material";
import {StudentProgressField} from "./assignmentList.tsx";
import { updateAssignmentTimeSpent } from '../../backend/assignments.ts';
import {isCoach, isStudent} from "../../businessLogic.ts";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import {Celebration} from "../../helpers/Celebration.tsx";
import { useLocation, useNavigate } from 'react-router-dom';
import {handleEnableGameSound, handleMuteHowler, playAssignmentCompleteSound} from "../../helpers/sounds.ts";
import { Edit, SimpleForm,} from 'react-admin';
import {LessonsReferenceField, LessonsReferenceInput} from "../lessons.tsx";
import {UsersReferenceInput} from "../users.tsx";

const getStatusChoices = () => {
    const choices = [
        { id: 'pending', name: 'Pending' },
        { id: 'not started', name: 'Not Started' },
        { id: 'completed', name: 'Completed' },
    ];

    return choices;
};

export const AssignmentShow = ({assignment, title, processUpdate, lessonId, isDirect, marginTop=0}) => {
    const [showCelebration, setShowCelebration] = useState(false);
    const timeSpentInSec = useRef<number | null>(null);
    const isActiveTimeTrackerEnabled = isStudent() && assignment.total_blocks !== assignment.completed_blocks
    useActiveTimeTracker({
        enabled: isActiveTimeTrackerEnabled, // Only Track active time for student and not for completed assignment
        onActive: (activeTimeInSec) => {
            // Using Ref becuase of state update won't work inside the callback (React Closure);
            if (activeTimeInSec > 0) {
                timeSpentInSec.current = activeTimeInSec;
            }
        },
        onInactive: async (timeSpendInSec) => {
            if (timeSpendInSec > 0) {
                // Update the timespent + lastTimeSpent for assignment only if it is a student
                await updateAssignmentTimeSpent(assignment.id, timeSpendInSec, assignment.time_spent)
            }
        },
    })

    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    useLayoutEffect(() => {
        if (isDirect) {
            setLocalStorage("is_app_sound_enabled", true);
        }
        return () => {
            if (isDirect) {
                removeLocalStorage("is_app_sound_enabled");
            }
        };
    }, []);

    const navigate = useNavigate ();
    const { state: locationState } = useLocation();
    const isAssignmentAlreadyCompleted = assignment.total_blocks === assignment.completed_blocks;

    const handleProgressUpdate = async (updatedAssignment) => {
        if (isAssignmentAlreadyCompleted) {
            return;  //don't shoe celebration if assignment is already completed
        }

        if (isStudent() && updatedAssignment.total_blocks == updatedAssignment.completed_blocks) {
            setShowCelebration(true);
            playAssignmentCompleteSound();
            await updateAssignmentTimeSpent(updatedAssignment.id, timeSpentInSec.current, updatedAssignment.time_spent)
        } else {
            setShowCelebration(false);
        }
        await processUpdate(updatedAssignment);
    }

    const getBackButtonTitle = () => {
        let title = isStudent() ? "Return To Class Workspace" : "Back To Assignment List";
        if (locationState.title) {
            title = `Back to ${locationState.title}`;
        }
        return title;
    }

    const ReturnButton = () => {
        const title = getBackButtonTitle();
        return (
            <Box display="flex" justifyContent="end" alignItems="center" mb="0.5rem" mr="0.5rem">
                <Button startIcon={<KeyboardReturnIcon/>} onClick={() => navigate(-1)}> {title} </Button>
            </Box>
        )
    }

    const handleSoundChange = () => {
        setIsSoundEnabled(prev => {
            const isAppSoundEnabled = !prev;
            setLocalStorage("is_app_sound_enabled", isAppSoundEnabled);
            handleEnableGameSound();
            handleMuteHowler(!isAppSoundEnabled);
            return isAppSoundEnabled;
        });
    };

    return (
       <>
            <Paper
                sx={{display: "flex", flexDirection: "column", marginTop: isCoach() ? "1rem" : marginTop}}
                elevation={1}>
                <Box
                    display="flex"
                    justifyContent={"space-between"}
                    position="sticky"
                    zIndex={theme => theme.zIndex.appBar}
                    top={isStudent() ? 0 : "3rem"}
                    borderRadius="0.3rem 0.3rem 0 0"
                    width="100%"
                    paddingY="0.2rem"
                    paddingX="0.5rem"
                    backgroundColor="LightSlateGrey"
                    color="white"
                    alignItems="center"
                    marginBottom="1rem"
                >
                    { !isDirect &&
                        <Box>
                            <Tooltip title={getBackButtonTitle()}>
                                <IconButton sx={{color: (theme) => theme.palette.common.white, p: "0rem"}} onClick={() => navigate(-1)}>
                                    <KeyboardReturnIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }
                    {(isCoach() || isDirect) && title}
                   {showCelebration && <Celebration/>}
                    <Box width="40%" display="flex" alignItems="center" justifyContent="end">
                        {assignment.is_assessment && <Stars sx={{ fontSize: "1.3rem", mr: '0.5rem', color: (theme) => theme.palette.info.light, background: theme => theme.palette.common.white, borderRadius: "50%" }}/>}
                        <StudentProgressField assignment={assignment}/>
                        { isDirect && // Show sound toggle only in direct mode
                            <Tooltip title="Toggle Sound">
                                <IconButton sx={{color: (theme) => theme.palette.common.white, p: "0rem", ml:"0.5rem"}}
                                            onClick={handleSoundChange}>
                                    {isSoundEnabled ? <VolumeUp/> : <VolumeOff/>}
                                </IconButton>
                            </Tooltip>
                        }
                    </Box>
                </Box>
                <Box sx={{flexGrow: 1, width: "100%", paddingLeft: '25px'}}>
                    <ChessAIField returnButton={!isDirect ? <ReturnButton/> : null} assignmentId={assignment.id} processUpdate={handleProgressUpdate} lessonId={lessonId} />
                </Box>
            </Paper>
        </>
    )
}

export const AssignmentEdit = () => (
    <Edit>
        <AssignmentForm />
    </Edit>
);

export const AssignmentForm = () => (
    <SimpleForm>
        <LessonsReferenceInput source="lesson_id" />
        <UsersReferenceInput source="user_id" />
        <SelectInput source="status" choices={getStatusChoices()} />
    </SimpleForm>
);

export const AssignmentCard = ({ assignment, title }: { assignment: any, title: String }) => {
    const host = window.location.origin;
    return (
        <Paper
            sx={{
                width: "100%",
                height: "100%",
                aspectRatio: "10 / 12",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
            elevation={1}
        >
            <RecordContextProvider value={assignment}>
                <Box
                    display="flex"
                    justifyContent={"space-between"}
                    padding="0.5rem"
                    backgroundColor="LightSlateGrey"
                    color="white"
                >
                    {title}

                    <Box width="40%" display="flex" alignItems="center" justifyContent="end">
                        {assignment.is_assessment && <Stars sx={{ fontSize: "1.3rem", mr: '0.5rem', color: (theme) => theme.palette.info.light, background: theme => theme.palette.common.white, borderRadius: "50%" }}/>}
                        <StudentProgressField />
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, width: "100%", height: "100%" }}>
                    <WithRecord
                        render={(record) => (
                            <LessonsReferenceField source="lesson_id" link={false}>
                                <WithRecord
                                    render={(lesson) => (
                                        <iframe
                                            title={`assignment-${record.id}`}
                                            src={`${host}/#/lessons/${lesson.id}/live?assignment=${record.id}`}
                                            width="100%"
                                            height="100%"
                                            style={{
                                                border: "none",
                                            }}
                                        />
                                    )}
                                />
                            </LessonsReferenceField>
                        )}
                    />
                </Box>
            </RecordContextProvider>
        </Paper>
    );
};

