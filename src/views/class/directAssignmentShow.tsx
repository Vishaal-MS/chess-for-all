import {useEffect, useState} from "react";
import {Loading, ShowBase} from "react-admin";
import {useParams} from "react-router-dom";
import {remoteLog, setLocalStorage} from "@mahaswami/vc-frontend";
import {LinkExpiredPage} from "../../components/LinkExpiredPage.tsx";
import {AssignmentShow} from "./assignments.tsx";
import {Box, Button, Typography} from "@mui/material";

export const DirectAssignmentShow = () => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const {tId, uniqueDirectAssignmentId } = useParams();
    const [state, setState] = useState({
        loading: true,
        user: undefined,
        assignment: undefined,
        isExpired: false,
        start_assignment: false,
    });

    const checkIfNotExpired =  (assignment: any) => {
        const {assigned_timestamp} = assignment;
        const now = new Date();
        const assignedDate = new Date(assigned_timestamp);
        const expiredDate = new Date(assignedDate.getTime() + 10 * 60 * 1000);
        return now >= expiredDate;
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLocalStorage('tenant_id', parseInt(tId));
                const {data: assignments} = await dataProvider.getList('assignments', {
                    filter: {unique_direct_assignment_identifier_eq: uniqueDirectAssignmentId, tenant_id_eq: parseInt(tId)},
                    pagination:  {page: 1, perPage: 100000},
                    meta:{prefetch:['students','lessons', 'classes']}
                });
                if (assignments.length == 0) {
                    throw new Error("Somebody is doing a bad thing.")
                }
                const assignment = assignments[0];
                const {data: user} = await dataProvider.getOne('users', {id: assignment.student.user_id});
                setLocalStorage('current_assignment_student_id', assignment.student_id);
                setLocalStorage('direct_assignment_mode', true)
                setLocalStorage('role', user.role);
                const isExpired =  checkIfNotExpired(assignment)
                setState({...state, loading: false, user: user, assignment: assignment, isExpired: isExpired})
            } catch (error) {
                remoteLog("Error on DirectAssignmentShow fetchData method: ", error);
                console.error("Error on DirectAssignmentShow fetchData method: ", error);
            }
        }
       fetchData()
    }, []);

    if (state.loading )
        return <Loading />;

    const user = state.user;
    const assignment = state.assignment
    const title = user?.fullName + " - " + assignment?.lesson?.name;

    const processUpdate = async (updatedAssignment) => {
        setState(prevState => ({
            ...prevState,
            assignment: {
                ...updatedAssignment,
                lesson: prevState.assignment.lesson,
                student: prevState.assignment.student
            }
        }));
    }
    if (state.isExpired) {
        return <LinkExpiredPage/>;
    }

    if (!state.start_assignment) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                minHeight: "100dvh", textAlign: "center", gap: "1rem", px: "1rem",
            }}>
                <Typography variant={"h4"} sx={{ wordBreak: "break-word" }}>{assignment?.class?.name + " - " + assignment?.lesson?.name}</Typography>
                <Button onClick={() => setState({...state, start_assignment: true })} >{`Click to ${assignment?.completed_blocks > 0 ? "resume" : "start"} assignment`}</Button>
            </Box>
        );
    }
    return (
        <ShowBase disableAuthentication resource='lessons' id={assignment?.lesson_id} actions={false}>
            {state.start_assignment &&
                <AssignmentShow isDirect assignment={assignment} title={title} processUpdate={processUpdate}
                                lessonId={assignment?.lesson_id}/>
            }
        </ShowBase>
    )
}
