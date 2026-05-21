import { useListContext, useRecordContext, WrapperField, Pagination } from "react-admin";
import {Empty} from "../common/empty.tsx";
import {Box} from "@mui/material";
import {isExecutiveCoachingFlavored, isParent, isStudent} from "../../businessLogic.ts";
import React, {useState} from "react";
import {DataTable, remoteLog, useRealtimeComms} from "@mahaswami/vc-frontend";
import {AssignmentStatus} from "../../helpers/constants.ts";
import {formatStatus} from "../../utils.ts";
import {useNavigate} from "react-router-dom";
import TimeField from "../../fields/TimeField.tsx";
import { Stars } from "@mui/icons-material";
import {StudentsReferenceField} from "../students.tsx";
import {UsersReferenceField} from "../users.tsx";
import {LessonsReferenceField} from "../lessons.tsx";


export const AssignmentList = ({classId, enrollmentId}) => {
    const { data: assignments } = useListContext();
    const realtimeComms = useRealtimeComms();
    const [updatedAssignments, setUpdatedAssignments] = useState<any>([]);
    const dataProvider = window.swanAppFunctions.dataProvider;
    const navigate = useNavigate();
    React.useEffect(() => {
        setUpdatedAssignments(assignments);
        const handleUpdate = (content, fromUserId, receivedTopic) => {
            const { assignment: receivedAssignment } = content;
            setUpdatedAssignments(prevAssignments =>
                prevAssignments.map(assigment => {
                    if (assigment.id == receivedAssignment.id) {
                        Object.assign(assigment, receivedAssignment);
                    }
                    return assigment;
                })
            )
        };
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

    const handleAssignmentClick = async (id) => {
        try {
            const { data: assignment } = await dataProvider.getOne('assignments', { id: id });
            navigate(`/lessons/${assignment?.lesson_id}/show`, {state: {assignmentId: assignment.id, classId: classId, enrollmentId: enrollmentId}});
            return false;
        } catch (error) {
            remoteLog("Error on handleAssignmentClick: ", error);
            console.error("Error on handleAssignmentClick: ", error);
        }
    }

    return (
        <>
            {isStudent() || isParent() ? (
                <DataTable empty={<Empty emptyText={"No Assignments yet"}/>} bulkActionButtons={false} rowClick={handleAssignmentClick}>
                    <DataTable.Col label="Lesson" render={(assignment) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: "0.5rem" }}>
                            <LessonsReferenceField source="lesson_id" link={false} />
                            {assignment.is_assessment && 
                                <Stars sx={{ color: (theme) => theme.palette.info.light, borderRadius: "50%" }}/>}
                        </Box>
                    )}/>
                    {isParent() && <DataTable.Col source='time_spent' field={() => <TimeField source="time_spent" />} />}
                    <WrapperField label="Progress">
                        <StudentProgressField />
                    </WrapperField>
                </DataTable>
            ) : (
                <DataTable empty={<Empty emptyText={"No Assignments yet"}/>} bulkActionButtons={false}
                    rowClick={handleAssignmentClick} data={updatedAssignments}>
                    <StudentsReferenceField source="student_id" label={isExecutiveCoachingFlavored() ? "Executive" : "Student"}
                        queryOptions={{meta: {embed: ['users']}}} link={false}>
                        <UsersReferenceField source="user_id" link={false} />
                    </StudentsReferenceField>
                    <DataTable.Col render={assignment => assignment.is_assessment &&
                                <Stars sx={{ color: (theme) => theme.palette.info.light}}/>}/>
                    <DataTable.Col source={"status"} label="Status" render={record => formatStatus(record.status)}/>
                    <DataTable.Col source='time_spent' field={() => <TimeField source="time_spent" label="Time Spent (mm:ss)"/>} />
                    <WrapperField label="Progress">
                        <StudentProgressField/>
                    </WrapperField>
                </DataTable>
            )
            }
            <Pagination />
        </>
    );

};

export const StudentProgressField = ({assignment}) => {
    const record = assignment ? assignment : useRecordContext();
    const isIncorrect = record.status === AssignmentStatus.IN_CORRECT && !isStudent();
    const isCheckPending = record.status === AssignmentStatus.CHECK_PENDING && !isStudent();
    const total = record.total_blocks;
    const completedBlocks = record.completed_blocks || 0;
    const notStartedCount = total - completedBlocks;
    const notStartedColor = isIncorrect ? "red" : (isCheckPending ? "lightGray" : "orange");
    const completedColor = isIncorrect ? "red" : (isCheckPending ? "lightGray" : "green");

    const progressValues = [
        {
            label: 'Completed',
            value: completedBlocks,
            percent: (completedBlocks / total) * 100,
            color: completedColor
        },
        {
            label: 'Not Started',
            value: notStartedCount,
            percent: (notStartedCount / total) * 100,
            color: notStartedColor
        }
    ];

    return (
        <Box
            sx={{
                width: '100%',
                height: '18px',
                borderRadius: '16px',
                background: `linear-gradient(45deg, ${progressValues
                    .map((p, i) => {
                        const start = i === 0 ? 0 : progressValues[i - 1].percent;
                        const end = start + p.percent;
                        return `${p.color} ${start}% ${end}%`;
                    })
                    .join(', ')})`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                overflow: 'hidden',
            }}
        >
            {completedBlocks}/{total}
        </Box>
    )
}

