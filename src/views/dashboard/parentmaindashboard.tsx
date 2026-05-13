import React, { useEffect, useState } from "react";
import {
    Loading,
    Title,
    useSidebarState
} from "react-admin";
import {getCurrentParentStudent, getParentId} from "../../businessLogic";
import {ListTitle} from "../../components/Title.tsx";
import ParentStudentDashboard from "./ParentAndStudentDashBoard.tsx";
import { remoteLog } from "@mahaswami/vc-frontend";
import {SwanShow, SwanView} from "../swan_crud/SwanCrud.tsx";


export const Parentmaindashboard = () => {

    const dataProvider = window.swanAppFunctions.dataProvider;
    const [studentId, setStudentId] = useState(0);
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [studentName, setStudentName] = useState('');
    const [sideBarOpen, setSidebarOpen] = useSidebarState();
    const [parentRecord, setParentRecord] = useState();
    const parentId = getParentId();
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const student = await getCurrentParentStudent(dataProvider);
                const studentIdLocal = student[0]?.id;
                setStudentId(studentIdLocal);
                const { data: assignmentsData } = await dataProvider.getList('assignments', {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'id', order: 'ASC' },
                    filter: { student_id: studentIdLocal }
                });
                const {data: userData} = await dataProvider.getOne("users", {id: student[0].user_id});
                setStudentName(userData.fullName);

                setAssignments(assignmentsData);
                const {data: parentData} = await dataProvider.getList('parent_notes');
                const filteredNotes = parentData.filter(note => note.student_id === studentId);
                setParentRecord(filteredNotes.length);
                setLoading(false);
            } catch (error) {
                remoteLog("Error sending on Parentmaindashboard fetchAssignments method: ", error);
            }
        }
        if (sideBarOpen) {
           setSidebarOpen(false);
        }
        fetchAssignments();
    }, []);



    if (loading) return <Loading />;

    return (
        <>
            <SwanView>
                <Title title={<ListTitle resourceName={`${studentName} - Parent Dashboard`}/>} />
                <ParentStudentDashboard studentId={studentId} parentId={parentId} assignments={assignments} parentRecord={parentRecord}/>
            </SwanView>
        </>
    )
}