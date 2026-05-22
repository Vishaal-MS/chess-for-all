import {
    List,
    TextField,
    ReferenceManyCount,
    Loading,
    useRefresh,
    SelectInput
} from "react-admin";
import {Typography} from "@mui/material";
import {Edit} from "react-admin";
import {useRedirect, useNotify} from "react-admin";
import {closeDialog, DataTable, SimpleForm} from "@mahaswami/vc-frontend";
import {
    ClientTypes,
    EnrolmentStatus,
    EPOCHE_ZERO_DATE,
    studentStatusChoices,
    UserStatus
} from "../../helpers/constants.ts";
import { StudentClasses } from "./studentClasses.tsx";
import {useEffect, useState} from "react";
import {isRegularSchoolFlavored} from "../../backend/common_logics.ts";
import {ExtendedStudentFields} from "../students/extendedStudentFields.tsx";
import {UsersReferenceField} from "../users.tsx";
import {ClientsReferenceField} from "../clients.tsx";


export const MyStudentsList = () => {
    return(
        <List>
            <DataTable bulkActionButtons={false}>
                <DataTable.Col label="Name" source="user_id" field={() =>
                    <UsersReferenceField source={"user_id"} link={false}>
                        <TextField source={"fullName"} />
                    </UsersReferenceField>
                }/>
                <DataTable.Col label="Client" source="client_id" field={ClientsReferenceField}/>
                <ReferenceManyCount reference={"enrollments"} target={"student_id"} label={"Scheduled Classes"} filter={{status: EnrolmentStatus.SCHEDULED}} />
                <ReferenceManyCount reference={"enrollments"} target={"student_id"} label={"Active Classes"} filter={{status: EnrolmentStatus.IN_PROGRESS}} />
                <ReferenceManyCount reference={"enrollments"} target={"student_id"} label={"Completed Classes"} filter={{status: EnrolmentStatus.COMPLETED}} />
            </DataTable>
        </List>
    )
}

export const StudentEdit = (props) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const notify = useNotify();
    const redirect = useRedirect();
    const [state, setState] = useState({
        standardId: null,
        studentId: props.studentId,
        loading: true
    });
    const clientId = props?.clientId || null;
    const refresh = useRefresh();


    useEffect(() => {
        const fetchClient = async () => {
            try {
                if (isRegularSchoolFlavored() && !clientId) {
                    const {data: clients} = await dataProvider.getList('clients');
                    const client = clients[0] || null;
                    if (client) {
                        setState(prevState => ({...prevState,  standardId: client?.standard_id, loading: false}));
                    }
                } else {
                    const { data: client } = await dataProvider.getOne('clients', { id: clientId });
                    if (client) {
                        setState(prevState => ({...prevState,  standardId: client?.standard_id || null, loading: false}));
                    }
                }
            } catch (error) {
                notify('Failed to fetch client info', { type: 'error' });
            }
        };
        fetchClient();
    }, []);

    if (state.loading)
        return <Loading />;

    const {standardId, studentId} = state

    const onSuccess = async (data) => {
        notify('Student details updated successfully', { type: 'success' });
        closeDialog();
        if (isRegularSchoolFlavored()) {
            redirect('/clients');
        } else {
            redirect(`/clients/${data.client_id}/1`);
        }
        refresh();
    }

    return (
        <Edit resource="students" id={studentId}  queryOptions={{meta: {prefetch: ['users', 'client_types']}}}
              mutationOptions={{onSuccess}} mutationMode="pessimistic">
            <Typography variant="h6" sx={{ p: 2 }}>
                Edit Student
            </Typography>
            <SimpleForm>
                <ExtendedStudentFields mode={'edit'} standardId={standardId} />
                <StudentClasses studentId={studentId} />
            </SimpleForm>
        </Edit>
    );
};

export const StudentStatusSelect = ({user = {}, type}) => {

     const status = user?.status;

    const choices = studentStatusChoices.filter((choice:any) => {
        if(status === UserStatus.ACTIVE){
           return  choice.name !== UserStatus.PENDING
        } else if (status === UserStatus.PENDING) {
            return choice.name !== UserStatus.ACTIVE
        } else if( user.last_login_date && user.last_login_date === EPOCHE_ZERO_DATE) {
            return choice.name !== UserStatus.ACTIVE
        } else {
            return  choice.name !== UserStatus.PENDING
        }
    })
    const source = type === ClientTypes.INDIVIDUAL ? 'student.user.status' : 'user.status';
    return <SelectInput source={source} choices={choices} label="Status" />
}
