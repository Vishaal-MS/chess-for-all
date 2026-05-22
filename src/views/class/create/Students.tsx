import {
    DeleteButton, ReferenceManyField, TextField, useRefresh, useUnselectAll
} from "react-admin";
import {Box} from "@mui/material";
import {EnrollStudentsButton, EnrollStudentsDialog} from "../addStudents.tsx";
import {DataTable, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {isExecutiveCoachingFlavored} from "../../../backend/common_logics.ts";
import { AvatarField } from "../../../fields/AvatarField.tsx";
import {Empty} from "../../common/empty.tsx";
import {useEffect} from "react";
import {UsersReferenceField} from "../../users.tsx";
import {ClientsReferenceField} from "../../clients.tsx";
import {StandardGradesReferenceField} from "../../standard_grades.tsx";

const Students = ({showStudentList, setShowStudentList, classRecord }) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const refresh= useRefresh();
    const unselectAll = useUnselectAll('students');
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const isSchoolClass = classRecord?.is_school_class;
    const recordId = classRecord?.id;

    useEffect(() => {
        if (showStudentList) {
            unselectAll()
        }
    }, [showStudentList])

    if (showStudentList) {
        return (
    <Box sx={{height: 'calc(100vh - 15rem)', overflow: 'auto'}}>
                <EnrollStudentsDialog classRecord={classRecord} dataProvider={dataProvider}
                    refresh={refresh} showStudentList={showStudentList} postEnroll={() => setShowStudentList(false)}/>
            </Box>
        )
    }

    return (
        <Box sx={{ height: 'calc(100vh - 15rem)', overflow: 'auto'}}>
            <ReferenceManyField reference="enrollments" perPage={PER_PAGE} target={"class_id"} record={{ id: recordId }}
                                pagination={<SensibleDefaultPagination />} queryOptions={{meta: {prefetch: ['students']}}}>
                <DataTable empty={<Empty emptyText={'No students yet'}/>} bulkActionButtons={false} rowClick={false} >
                    <DataTable.Col label={isExecutiveCoachingFlavor ? "Executive" : "Student"} source='student.user_id' field={() =>
                        <UsersReferenceField source="student.user_id" link={false} sx={{display: "flex", alignItems: "center", gap: 1}}>
                            <AvatarField/>
                            <TextField source="fullName"/>
                        </UsersReferenceField>
                    } />
                    {!(isSchoolClass || isExecutiveCoachingFlavor) &&
                        <DataTable.Col label="Type" source="student.client_id" field={() =>
                            <ClientsReferenceField label="Type" source="student.client_id" link={false}>
                                <TextField source="client_type.name" />
                            </ClientsReferenceField>
                        } />
                    }
                    {!(isSchoolClass || isExecutiveCoachingFlavor) &&
                        <DataTable.Col source="student.client_id" label="Client" field={() =>
                            <ClientsReferenceField source="student.client_id" label="Client" link={false}/>} /> }
                    <DataTable.Col source="student.emergency_contact" label="Emergency Contact"/>
                    {!isExecutiveCoachingFlavor && (
                        !isSchoolClass ?
                            <DataTable.Col source="student.grade" label="Grade"/> :
                            <DataTable.Col source="student.standard_grade_id" label="Grade" field={StandardGradesReferenceField} />
                    )}
                    <DataTable.Col label={false} field={() => <DeleteButton label={false} redirect={'/classes/create'}/> } />
                </DataTable>
            </ReferenceManyField>
            <EnrollStudentsButton classRecord={classRecord} refreshFn={refresh}/>
        </Box>
    )
}

export default Students;