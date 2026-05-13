import {
    Button,
    EmailField,
    ReferenceManyField,
    required,
    TabbedForm, TextField,
    TextInput,
    useRecordContext
} from "react-admin";
import {
    DataTable,
    formDefaults, openDialog,
    PER_PAGE,
    SensibleDefaultPagination,
    SimpleForm
} from "@mahaswami/vc-frontend";
import {Box } from "@mui/material";
import {ClientTypes, getSetupLabel} from "../../helpers/constants.ts";
import {ExtendedClientFields} from "./ExtendedClientFields.tsx";
import {Empty} from "../common/empty.tsx";
import {UsersReferenceField} from "../users.tsx";
import {AvatarField} from "../../fields/AvatarField.tsx";
import {isSchoolStandardLinked} from "../../businessLogic.ts";
import {StandardGradesReferenceInput} from "../standard_grades.tsx";
import {StudentClasses} from "./studentClasses.tsx";
import {AddStudents} from "./addStudents.tsx";
import { StudentEdit } from "./students.tsx";

const ClientEditForm = (props: any) => {
    const record = useRecordContext();
    const clientType = record?.client_type?.name;

    const showStudentEditDialog = (studentId) => {
        openDialog(<StudentEdit width="80vw" studentId={studentId} clientId={record?.id}/>);
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

    const handleRowClick = (id, resource, record) => {
        showStudentEditDialog(record?.id);
        return false;
    }

    return (
        <Box>
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
                        <ReferenceManyField pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} reference="students"
                                            target="client_id" label="Students" queryOptions={{meta: {prefetch: ['users']}}}>
                            <DataTable sx={{ width: '100%' }} rowClick={handleRowClick} bulkActionButtons={false}
                                       empty={<Empty emptyText={'No Students added yet'}/>}>
                                <DataTable.Col label='Profile'>
                                    <UsersReferenceField source="user_id" link={false} label={"Profile"}>
                                        <AvatarField />
                                    </UsersReferenceField>
                                </DataTable.Col>
                                <DataTable.Col label='First Name'>
                                    <UsersReferenceField source="user_id" link={false} label={"First Name"}>
                                        <TextField source="first_name" />
                                    </UsersReferenceField>
                                </DataTable.Col>
                                <DataTable.Col label='Last Name'>
                                    <UsersReferenceField source="user_id" link={false} label={"Last Name"}>
                                        <TextField source="last_name" />
                                    </UsersReferenceField>
                                </DataTable.Col>
                                <DataTable.Col label='Email'>
                                    <UsersReferenceField source="user_id" reference="users" link={false} label={"Email"}>
                                        <EmailField source="email"/>
                                    </UsersReferenceField>
                                </DataTable.Col>
                                <DataTable.Col field={() => isSchoolStandardLinked() ?
                                    <StandardGradesReferenceInput source={"standard_grade_id"} reference={"standard_grades"} label={"Grade"} /> :
                                    <TextField source={'grade'} label={"grade"}/>
                                }/>
                            </DataTable>
                        </ReferenceManyField>
                        <AddStudentButton />
                    </TabbedForm.Tab>
                </TabbedForm>
            }
        </Box>
    )
}
export default ClientEditForm;