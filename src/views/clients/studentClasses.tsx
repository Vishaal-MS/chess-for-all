import { Datagrid, DateField, List, ReferenceField, TextField, useRecordContext } from "react-admin";
import { Typography } from "@mui/material";
import {
   isDivisionAdmin,
   isExecutiveCoachingFlavored,
   isOrgAdmin,
   isRegularSchoolFlavored,
} from "../../businessLogic";
import { useEffect, useState } from "react";
import { getClassIdByStudentId } from "../../backend/clients";
import {Empty} from "../../common/empty.tsx";

export const StudentClasses = ({studentId}: {studentId? : number}) => {

   const [classIds, setClassIds] = useState();
   const record = useRecordContext();
   const studendRecordId = studentId || record?.student.id;
   const isStandardLinkedOrExecutive = isRegularSchoolFlavored() || isExecutiveCoachingFlavored();

   useEffect(() => {
      const getClassIds = async() => {
         const studentClassIds = await getClassIdByStudentId(studendRecordId);
         setClassIds(studentClassIds);
      }
      getClassIds();
   }, [])

   return(
      <>
         <Typography sx={{ml: 1}}>Classes</Typography>
         <List key='student-classes' empty={<Empty showIcon={false} emptyText={"No Classes for the student"}/>} actions={false} exporter={false}
            resource="classes" perPage={1000} filter={{id : classIds}} storeKey={false} sx={{ width: '100%' }}>
            <Datagrid rowClick={false}>
               <TextField source="name" label="Name" />
               {!isStandardLinkedOrExecutive &&
                   <ReferenceField source="teaching_mode_id" reference="teaching_modes" link={false}
                  queryOptions={{ meta: { scopingEscapeHatch: true }}} label="Coaching Mode" />}
                  <DateField source="start_date" label="Start Date" />
                  <DateField source="end_date" label="End Date" />
                  <TextField source="status"  sx={{ textTransform: 'capitalize' }}/>
                  {(isOrgAdmin() || isDivisionAdmin()) && <ReferenceField source="coach_id" reference="coaches" label={isRegularSchoolFlavored() ? "Teacher" : "Coach"}>
                  <ReferenceField source="user_id" reference="users" label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} link={false}>
                     <TextField source="fullName" />
                  </ReferenceField>
               </ReferenceField>}
            </Datagrid>
         </List>
      </>
   );
}