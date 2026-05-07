import {
    Loading,
    RecordContextProvider,
    ReferenceField,
    useGetList,
    useListContext, useRefresh,
    WithRecord,
} from "react-admin";
import {Box, IconButton, Paper, Stack, Typography} from "@mui/material";
import { StudentProgressField } from "./assignmentList";
import {remoteLog, useRealtimeComms} from "@mahaswami/vc-frontend";
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {AssignmentCard} from "./assignments.tsx";
import {Empty} from "../common/empty";
import { AssignmentBlockStatus } from "../../helpers/constants.ts"; 

export const AssignmentsLiveGrid = () => {
    const { data: assignments = [], isLoading } = useListContext();
    const [ updatedAssignments, setUpdatedAssignments ] = useState<any>([]);
    const realtimeComms = useRealtimeComms();
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 6;

    React.useEffect(() => {
        setUpdatedAssignments(assignments);
        assignments?.forEach(assignment => {
            const topic = `assignments/${assignment.id}`;
            realtimeComms.subscribe(topic, handleUpdate);
        })
        return () => {
            assignments?.forEach(assignment => {
                const topic = `assignments/${assignment.id}`;
                realtimeComms.unsubscribe(topic, handleUpdate);
            })
        };
    }, [assignments])

    const handleUpdate = useCallback((content) => {
        const { assignment: receivedAssignment } = content;
        setUpdatedAssignments(prevAssignments =>
            prevAssignments.map(assigment => {
                if (assigment.id == receivedAssignment.id) {
                    return receivedAssignment;
                }
                return assigment;
            })
        )
        if (receivedAssignment.status === AssignmentBlockStatus.COMPLETED) {
            setTimeout(() => {
                setUpdatedAssignments(prevAssignments =>
                    prevAssignments.filter(assigment => assigment.status != AssignmentBlockStatus.COMPLETED)
                )
            }, 500);
        }
    }, []);

    const totalPages = Math.ceil(updatedAssignments.length / PAGE_SIZE);
    const paginatedAssignments = updatedAssignments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const handlePrev = () => setPage((p) => Math.max(p - 1, 0));
    const handleNext = () => setPage((p) => Math.min(p + 1, totalPages - 1));
    const noMorePendingAssignment = paginatedAssignments.length == 0;

    if (isLoading) return <Loading/>
    return (
        <Box>
            <Box
                sx={{
                    minHeight: "80vh",
                    overflow: "auto",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: 1,
                    p: 1,
                    boxSizing: "border-box",
                }}
            >
                {noMorePendingAssignment
                ? <Empty emptyText="No More Pending Assignments"/>
                : paginatedAssignments?.map(assignment => {
                    return <RenderAssignmentLiveCard key={assignment.id} assignment={assignment} />
                })}
            </Box>

            {totalPages > 1 && (
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} py={2}>
                    <IconButton onClick={handlePrev} disabled={page === 0} color="primary">
                        <ArrowBackIosIcon fontSize="small" />
                    </IconButton>

                    <Typography variant="body2" color="textSecondary">
                        Page {page + 1} of {totalPages}
                    </Typography>

                    <IconButton onClick={handleNext} disabled={page === totalPages - 1} color="primary">
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Stack>
            )}
        </Box>
    );
};

const RenderAssignmentLiveCard = ({ assignment }) => {
    const [title, setTitle] = React.useState();
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetchTitle = async () => {
            try {
                const dataProvider = window.swanAppFunctions.dataProvider;
                const { data: user } = await dataProvider.getOne('users', { id: assignment?.student?.user_id });
                setTitle(user?.fullName);
                setIsLoading(false);
            } catch (error) {
                remoteLog("Error on RenderAssignmentLiveCard fetchTitle: ", error);
                console.error("Error on RenderAssignmentLiveCard fetchTitle: ", error);
            }
        }
        fetchTitle();
    }, []);
    if (isLoading) return <Loading />;
    return (
        <AssignmentCard assignment={assignment} title={title}/>
    )
}