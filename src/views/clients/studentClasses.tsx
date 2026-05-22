import { DateField, List, TextField, useRecordContext } from "react-admin";
import { Typography } from "@mui/material";
import {
   isDivisionAdmin,
   isExecutiveCoachingFlavored,
   isOrgAdmin,
   isRegularSchoolFlavored,
} from "../../backend/common_logics";
import {Fragment, useEffect, useState} from "react";
import { getClassIdByStudentId } from "../../backend/clients";
import {Empty} from "../common/empty.tsx";
import {DataTable} from "@mahaswami/vc-frontend";
import {TeachingModesReferenceField} from "../teaching_modes.tsx";
import {CoachesReferenceField} from "../coaches.tsx";
import {UsersReferenceField} from "../users.tsx";

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
      <Fragment>
         <Typography sx={{ml: 1}}>Classes</Typography>
         <List key='student-classes' empty={<Empty showIcon={false} emptyText={"No Classes for the student"}/>} actions={false} exporter={false}
            resource="classes" perPage={1000} filter={{id : classIds}} storeKey={false} sx={{ width: '100%' }}>
            <DataTable rowClick={false} bulkActionButtons={false}>
               <DataTable.Col source="name" label="Name" />
               {!isStandardLinkedOrExecutive &&
                   <DataTable.Col source='teaching_mode_id'>
                      <TeachingModesReferenceField source="teaching_mode_id" link={false}
                     queryOptions={{ meta: { scopingEscapeHatch: true }}} label="Coaching Mode" />
                   </DataTable.Col>
               }
               <DataTable.Col source="start_date" label="Start Date" field={DateField} />
               <DataTable.Col source="end_date" label="End Date" field={DateField} />
               <DataTable.Col source="status"  sx={{ textTransform: 'capitalize' }}/>
               {(isOrgAdmin() || isDivisionAdmin()) &&
                   <DataTable.Col source='coach_id' field={() =>
                      <CoachesReferenceField source="coach_id" label={isRegularSchoolFlavored() ? "Teacher" : "Coach"}>
                         <UsersReferenceField source="user_id" label={isRegularSchoolFlavored() ? "Teacher" : "Coach"} link={false} />
                     </CoachesReferenceField>
                   }/>
               }
            </DataTable>
         </List>
      </Fragment>
   );
}