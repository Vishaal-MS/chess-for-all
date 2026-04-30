import {
    Button, DeleteButton,
    Edit, EmailField,
    ReferenceManyField,
    required,
    TabbedForm, TextField,
    TextInput,
    useGetRecordId,
    useRecordContext
} from "react-admin";
import {
    DataTable,
    editDefaults, formDefaults, openDialog,
    PER_PAGE,
    remoteLog,
    SensibleDefaultPagination,
    SimpleForm
} from "@mahaswami/vc-frontend";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Box} from "@mui/material";
import {ClientTypes, getSetupLabel} from "../../helpers/constants.ts";
import {ExtendedClientFields} from "./ExtendedClientFields.tsx";
import {Empty} from "../../common/empty.tsx";
import {UsersReferenceField} from "../users.tsx";
import {AvatarField} from "../../fields/AvatarField.tsx";
import {isSchoolStandardLinked} from "../../businessLogic.ts";
import {StandardGradesReferenceInput} from "../standard_grades.tsx";
import {StudentClasses} from "./studentClasses.tsx";
import {AddStudents} from "./addStudents.tsx";

const ClientEdit = (props: any) => {

    const [loading, setLoading] = useState(true);
    const [clientType, setClientType] = useState(null);
    const {id} = useParams();

    const recordId = Number(useGetRecordId());
    const record = useRecordContext();
    console.log("userDetails: ", record)
    // record contains the coach data passed from react-admin
    const dataProvider = window.swanAppFunctions.dataProvider;

    const showStudentEditDialog = (studentId) => {
        // openDialog(<StudentEdit width="80vw" studentId={studentId} clientId={recordId}/>);
    }

    const showStudentAddDialog = (record) => {
        openDialog(<AddStudents client={record} width="80vw"/>);
    }

    const AddStudentButton = () => {
        const record = useRecordContext();
        return (
            <Button onClick={() => showStudentAddDialog(record)} variant="contained" sx={{justifyContent: 'end', marginTop: 1 }}>Add</Button>
        )
    }

    // Fetch user data based on user_id from coach record
    useEffect(() => {
        const fetchClientType = async () => {
            try {
                const { data: client } = await dataProvider.getOne('clients', {
                    id: recordId,
                    meta: { prefetch: ['client_types']}
                });
                setClientType(client?.client_type.name);
                setLoading(false);
            } catch (err) {
                console.error("Error sending on clientEdit fetchClientType method: ", err);
                remoteLog("Error sending on clientEdit fetchClientType method: ", err);
            }
        }
        fetchClientType();
    }, []);

    const ClientDetails =() => {
        return (
            <Box width='100%'>
                {clientType === ClientTypes.INDIVIDUAL ?
                    <Box width='100%' display='grid' gridTemplateColumns={{ md: '1fr 1fr' }} gap='0.5rem'>
                        <TextInput source="student.user.first_name" label="First Name" validate={required()}/>
                        <TextInput source="student.user.last_name" label="Last Name" validate={required()}/>
                    </Box>
                    : <TextInput source="name" validate={required()}/>
                }
                <ExtendedClientFields clientType={clientType} isEditView/>
            </Box>
        )
    }
    let title = clientType === ClientTypes.INDIVIDUAL ? getSetupLabel().EDIT_PAGE_LABEL : (ClientTypes.BUSINESS + " Clients Edit");


    return (
        <Edit {...editDefaults(props)}>
            {clientType === ClientTypes.INDIVIDUAL ?
                <SimpleForm { ...formDefaults(props) }>
                    <ClientDetails/>
                    <StudentClasses/>
                </SimpleForm> :
                <TabbedForm>
                    <TabbedForm.Tab label="Client Details" >
                        <ClientDetails/>
                    </TabbedForm.Tab>
                    <TabbedForm.Tab label={"students"}>
                        <ReferenceManyField pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} reference="students" target="client_id" label="Students" queryOptions={{meta: {prefetch: ['users']}}}>
                            <DataTable rowClick={ (value) => { showStudentEditDialog(value) }} bulkActionButtons={false} empty={<Empty emptyText={'No Students added yet'}/>}>
                                <UsersReferenceField source="user_id" link={false} label={"Profile"}>
                                    <AvatarField />
                                </UsersReferenceField>
                                <UsersReferenceField source="user_id" reference="users" link={false} label={"First Name"}>
                                    <TextField source="first_name" />
                                </UsersReferenceField>
                                <UsersReferenceField source="user_id" reference="users" link={false} label={"Last Name"}>
                                    <TextField source="last_name" />
                                </UsersReferenceField>
                                <UsersReferenceField source="user_id" reference="users" link={false} label={"Email"}>
                                    <EmailField source="email"/>
                                </UsersReferenceField>
                                {isSchoolStandardLinked() ?
                                    <StandardGradesReferenceInput source={"standard_grade_id"} reference={"standard_grades"} label={"Grade"} /> :
                                    <TextField source={'grade'} label={"grade"}/>
                                }
                                <DeleteButton label={false} redirect={`/clients/${recordId}/1`}/>
                            </DataTable>
                        </ReferenceManyField>
                        <AddStudentButton />
                    </TabbedForm.Tab>
                </TabbedForm>
            }
        </Edit>
    )
}
export default ClientEdit;