import {
    SimpleForm,
    Create,
    useNotify,
    useRedirect,
} from "react-admin";
import {Typography} from "@mui/material";
import { closeDialog } from "@mahaswami/vc-frontend";
import {getStandardId, isRegularSchoolFlavored} from "../../backend/common_logics.ts";
import {ExtendedStudentFields} from "../students/extendedStudentFields.tsx";

export const AddStudents = (props: any) => {
    const notify = useNotify();
    const redirect = useRedirect();
    const client = props.client;
    const clientId = client?.id || null;
    const  standardId = isRegularSchoolFlavored() ? getStandardId() : client.standard_id || null;

    const onSuccess = async (data: any) => {
        notify('Student added successfully', {type: 'success'});
        closeDialog();
        if(isRegularSchoolFlavored()) {
            redirect('/clients')
        } else {
            redirect(`/clients/${data.client_id}/1`);
        }
    }
    return (
        <Create resource={"students"} mutationOptions={{onSuccess}}>
            <Typography variant="h6" sx={{ pl: 2}}>Create Student</Typography>
            <SimpleForm defaultValues={{client_id: clientId}}>
                <ExtendedStudentFields mode={'create'} standardId={standardId}/>
            </SimpleForm>
        </Create>
    )
}
