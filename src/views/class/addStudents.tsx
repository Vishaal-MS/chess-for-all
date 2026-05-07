import * as React from 'react';
import {Form, List, Loading, useNotify} from 'react-admin';
import { Typography, Stack, Box } from '@mui/material';
import { Datagrid, ReferenceField, TextField, TextInput, Button, ReferenceInput,
    AutocompleteInput, ListBase, Pagination 
} from 'react-admin';
import { openDialog,closeDialog, remoteLog } from '@mahaswami/vc-frontend';
import { useListContext, useUnselectAll } from 'react-admin';
import {useEffect, useState} from "react";
import {Empty} from "../common/empty";
import {
    currentTenantId,
    isExecutiveCoachingFlavored,
} from "../../businessLogic.ts";
import {EnrolmentStatus} from "../../helpers/constants.ts";
import { useFormContext } from 'react-hook-form';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import { FilterButtons } from './AddLessonFilterForm.tsx';
import { getUnEnrollmentStudents } from '../../backend/students.ts';
import { AvatarField } from '../../fields/AvatarField.tsx';

const BulkEnrollButton =  ({dataProvider,classId,refreshFn, showStudentList, postEnroll}) => {
    const { selectedIds } = useListContext();
    const [loading, setLoading] = React.useState(false);
    const notify = useNotify();
    const unselectAll = useUnselectAll('students');
    const handleClick = async () => {
        try {
            setLoading(true);
            let promises = [];
            selectedIds.forEach((studentId) => {
                const enrollmentData = {
                    class_id: parseInt(classId),
                    student_id: studentId,
                    enrollment_date: new Date(),
                    status: EnrolmentStatus.NOT_STARTED, 
                    tenant_id: currentTenantId()
                };
                const createPromise = dataProvider.create('enrollments', { data: enrollmentData });
                promises.push(createPromise);
            });
            //Wait for all updates to finish and then notify
            await Promise.all(promises);
            notify('Students enrolled successfully', { type: 'success' });
            unselectAll();
            if (showStudentList) {
                postEnroll?.();
            } else {
                closeDialog();
                setLoading(false);
            }
            refreshFn();
        } catch (error) {
            remoteLog("Error on BulkEnrollButton handleClick: ", error);
            console.error("Error on BulkEnrollButton handleClick: ", error);
        }
    }

    return (
        <Button label="Enroll" loading={loading} variant="contained" onClick={handleClick}>
        </Button>
    );
}

export const EnrollStudentsButton = ({classRecord, refreshFn}) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const unselectAll = useUnselectAll('students');
    const handleClick = () => {
        unselectAll();
        openDialog(
            <Box sx={{height: '70vh', width: '100%'}} width="80vw">
                <EnrollStudentsDialog classRecord={classRecord} dataProvider={dataProvider} refreshFn={refreshFn}/>
            </Box>
        );
    }

    return (<Button label="Add" variant="contained" onClick={handleClick} sx={{marginY: "0.5rem"}}/>);
}

const StudentDialogFilterForm = ({classRecord, isDialog, userIds, clientIds }) => {
    const { setFilters, selectedIds } = useListContext();
    const dataProvider = window.swanAppFunctions.dataProvider;
    const marginBottom = selectedIds.length > 0 ? 4 : 0;
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const isSchoolClass = classRecord?.is_school_class || false;
    const gradeId = classRecord?.standard_grade_id || null;
    const defaultFilter = isSchoolClass && gradeId ? { standard_grade_id: gradeId } : {};
    const [standardId, setStandardId] = useState(null);

    useEffect(() => {
        const fetchStandardId = async () => {
            try {
                if (classRecord?.client_id) {
                    const {data: client} = await dataProvider.getOne('clients', {id: classRecord?.client_id});
                    setStandardId(client?.standard_id);
                }
            } catch (error) {
                remoteLog('Failed to fetch client info', error);
                console.error('Failed to fetch client info', error);
            }
        }
        fetchStandardId();
    }, [classRecord?.client_id]);


    return (
        <Form onSubmit={(values: any) => setFilters(values)}>
            <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1.5, width: isDialog ? "100%" : "70%", 
                height: "4rem", alignItems: "center", mb: marginBottom, mt: 0.4 }}>
                <ReferenceInput perPage={1000} source="user_id" reference="users" filter={{id: userIds}} alwaysOn>
                    <AutocompleteInput sx={{ flexGrow: 1 }} label={isExecutiveCoachingFlavor ? "Executive" : "Student"}/>
                </ReferenceInput>
                {!isExecutiveCoachingFlavor && (
                    !isSchoolClass ? (
                        <>
                            <ReferenceInput source="client_id" reference="clients" filter={{id: clientIds}}
                                            perPage={1000} alwaysOn>
                                <AutocompleteInput sx={{flexGrow: 1}} label="Client"/>
                            </ReferenceInput>
                            <TextInput source="grade" label="Grade" alwaysOn/>
                        </>) : (
                        <ReferenceInput source={'standard_grade_id'} reference={'standard_grades'} filter={{standard_id: standardId}} queryOptions={{meta: {scopingEscapeHatch: true}}}>
                            <AutocompleteInput optionText={'name'} label={'Grade'} defaultValue={gradeId}/>
                        </ReferenceInput>
                    )

                )}
                <Box sx={{mb: 2}}>
                    <FilterButtons onClick={() => setFilters(defaultFilter)}/>
                </Box>
            </Stack>
        </Form>
    );
};

export const EnrollStudentsDialog = ({classRecord, dataProvider, refreshFn, ...props}) => {
    const isExecutiveCoachingFlavor = isExecutiveCoachingFlavored();
    const { showStudentList } = props;
    const gradeId = classRecord?.standard_grade_id || null;
    const classId = classRecord?.id || null;
    const isSchoolClass = classRecord?.is_school_class || false;
    const gradeFilter = (isSchoolClass && gradeId) ? { standard_grade_id: gradeId } : {};
    const [state, setState] = React.useState({
        enrolledstudentIds: [],
        userIds: [],
        clientIds: [],
        loading: true
    })


    useEffect(() => {
        if (classId) {
            const fetchEnrollmentStudents = async () => {
                try {
                    const { data: enrollments } = await dataProvider.getList('enrollments', {
                        filter: { class_id: classId }
                    });
                    const enrolledStudentIds = enrollments.map(enrollment => enrollment.student_id);
                    const unEnrolledStudents = await getUnEnrollmentStudents(dataProvider, enrolledStudentIds, classRecord);
                    const unEnrolledUserIds = unEnrolledStudents.map((student) => student.user_id);
                    const unEnrolledClientIds = unEnrolledStudents.map((student) => student.client_id);
                    setState({
                        enrolledstudentIds: enrolledStudentIds,
                        userIds: unEnrolledUserIds,
                        clientIds: unEnrolledClientIds,
                        loading: false
                    });
                } catch (error) {
                    remoteLog("Error on fetchEnrollmentStudents: ", error);
                    console.error("Error on fetchEnrollmentStudents: ", error);
                }
            }
            fetchEnrollmentStudents();
        }
    }, [classId]);
    
    if (state.loading) return <Loading />

    let filter = {id_neq_any: state.enrolledstudentIds};
    if (classRecord?.is_school_class) {
        filter = {...filter, client_id: classRecord?.client_id || null};
    }

    return (
            <>
                {!showStudentList && <Typography variant="h6" sx={{padding:1, mb:1}}>{`Select ${isExecutiveCoachingFlavor ? 'Executives' : 'Students' }`}</Typography>}
                <ListBase resource="students" storeKey={false} disableSyncWithLocation filterDefaultValues={gradeFilter}
                    filter={filter} queryOptions={{ gcTime: 0 }}>
                    <StudentDialogFilterForm classRecord={classRecord} isDialog={!showStudentList} userIds={state.userIds} clientIds={state.clientIds}/>
                <Datagrid sx={{
                    "& .RaDatagrid-tableWrapper": {
                        maxHeight: "39vh",
                        overflow: "auto"
                    }
                 }}  bulkActionButtons={<BulkEnrollButton dataProvider={dataProvider} classId={classId} refreshFn={refreshFn} {...props}/>} rowClick={false} >
                    <ReferenceField source="user_id" reference="users" link={false} label={isExecutiveCoachingFlavor ? "Executive" : "Student"} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AvatarField/>
                        <TextField source='fullName'/>
                    </ReferenceField>
                    {!(isSchoolClass || isExecutiveCoachingFlavor) &&
                        <ReferenceField label="Type" source="client_id" reference="clients" link={false}
                                                                  queryOptions={{meta: {prefetch: ['client_types']}}}>
                        <TextField  source="client_type.name" />
                    </ReferenceField>}
                    {!(isSchoolClass || isExecutiveCoachingFlavor) &&
                        <ReferenceField source="client_id" reference="clients" link={false}/>}
                    <TextField source="emergency_contact" label="Emergency Contact" />
                    {!isExecutiveCoachingFlavor && (
                        !isSchoolClass ?
                            <TextField source="grade" label="Grade"/> :
                            <ReferenceField source="standard_grade_id" reference={"standard_grades"} label="Grade" link={false}>
                                <TextField source={'name'} label={"Grade"}/>
                            </ReferenceField>
                    )}
                </Datagrid>
                <Pagination/>
            </ListBase>
            </>
    )

}
