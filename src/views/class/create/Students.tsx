import {
    Datagrid, DeleteButton,
    ReferenceField,
    ReferenceManyField,
    TextField,
    useRefresh,
    useUnselectAll
} from "react-admin";
import {Box} from "@mui/material";
import {EnrollStudentsButton, EnrollStudentsDialog} from "../addStudents.tsx";
import {PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import React from "react";
import {isExecutiveCoachingFlavored} from "../../../businessLogic.ts";
import { AvatarField } from "../../../fields/AvatarField.tsx";
import {Empty} from "../../common/empty.tsx";

const Students = ({showStudentList, setShowStudentList, classRecord }) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const refresh= useRefresh();
    const unselectAll = useUnselectAll('students');
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const isSchoolClass = classRecord?.is_school_class;
    const recordId = classRecord?.id;

    React.useEffect(() => {
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
            <ReferenceManyField reference="enrollments" perPage={PER_PAGE} target={"class_id"} record={{ id: recordId }} pagination={<SensibleDefaultPagination />} queryOptions={{meta: {prefetch: ['students']}}}>
                <Datagrid sx={{
                      "& .RaDatagrid-tableWrapper": {
                          maxHeight: "calc(100vh - 22rem)",
                          overflow: "auto"
                      }
                   }} empty={<Empty emptyText={'No students yet'}/>} bulkActionButtons={false} rowClick={false} >

                    <ReferenceField source="student.user_id" label={isExecutiveCoachingFlavor ? "Executive" : "Student"} reference="users" link={false} sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <AvatarField/>
                        <TextField source="fullName"/>
                    </ReferenceField>
                    {!(isSchoolClass || isExecutiveCoachingFlavor) &&
                        <ReferenceField label="Type" source="student.client_id"reference="clients" queryOptions={{meta: {prefetch: ['client_types']}}} link={false}>
                        <TextField source="client_type.name" />
                    </ReferenceField>}
                    {!(isSchoolClass || isExecutiveCoachingFlavor) && <ReferenceField source="student.client_id" label="Client" reference="clients" link={false}/>}
                    <TextField source="student.emergency_contact" label="Emergency Contact"/>
                    {!isExecutiveCoachingFlavor && (
                        !isSchoolClass ?
                            <TextField source="student.grade" label="Grade"/> :
                            <ReferenceField source="student.standard_grade_id" reference={"standard_grades"} label="Grade" link={false}>
                                <TextField source={'name'}/>
                            </ReferenceField>
                    )}
                    <DeleteButton label={false} redirect={'/classes/create'}/>
                </Datagrid>
            </ReferenceManyField>
            <EnrollStudentsButton classRecord={classRecord} refreshFn={refresh}/>
        </Box>

    )
}

export default Students;