import {
    Button, Create,
    Edit, List,
    TextInput,
    TopToolbar, useNotify, useUnique
} from "react-admin"
import {isSuperAdmin} from "../../businessLogic.ts";
import {
    closeDialog,
    DataTable,
    openDialog,
    PER_PAGE,
    SensibleDefaultPagination,
    SimpleForm
} from "@mahaswami/vc-frontend";
import AddIcon from "@mui/icons-material/Add";
import {Box, Typography} from "@mui/material";

export const GradeList = ({standardId}) => {
    const superAdmin = isSuperAdmin();
    const showGradeDialog = (id) => {
        openDialog(<GradeEdit gradeId={id}/>)
    }

    const CreateGradeToolBar = () => {
        const createGradeDialog = () => (
            openDialog(<GradeCreate standardId={standardId}/>)
        )
        return (
            <TopToolbar>
                <Button startIcon={<AddIcon/>} label={"Create Grade"} onClick={createGradeDialog}/>
            </TopToolbar>
        )
    }

    return(
        <List resource="standard_grades" filter={{standard_id: standardId}} title={standardId ? false : "standard_grades" }
              exporter={false} actions={superAdmin ? <CreateGradeToolBar /> : false} sx={{width: '100%'}}
              disableSyncWithLocation pagination={<SensibleDefaultPagination />} perPage={PER_PAGE}>
            <DataTable rowClick={superAdmin ? showGradeDialog : false} bulkActionButtons={false}>
                <DataTable.Col source="name"/>
                <DataTable.Col source="code"/>
            </DataTable>
        </List>
    )
}

export const GradeCreate = ({standardId}) => {
    const notify = useNotify();
    const unique = useUnique({resource: "standard_grades"});
    const onSuccess = async (data: any) => {
        notify('Grade details created successfully', { type: 'success' });
        closeDialog();
    }

    return (
        <Box>
            <Typography variant="h6" sx={{pl: 2}}>Create Grade</Typography>
            <Create resource="standard_grades" title={false} redirect={false} mutationOptions={{onSuccess}}>
                <SimpleForm defaultValues={{standard_id: standardId}}>
                    <TextInput source="name"/>
                    <TextInput source="code" validate={[unique()]}/>
                </SimpleForm>
            </Create>
        </Box>
    )
}

export const GradeEdit = ({gradeId}) => {
    const notify = useNotify();
    const unique = useUnique({resource: "standard_grades"});
    const onSuccess = async (data: any) => {
        notify('Grade details updated successfully', { type: 'success' });
        closeDialog();
    }

    return (
        <Box>
            <Typography variant="h6" sx={{pl: 2, pb: 0}}>Edit Grade</Typography>
            <Edit resource="standard_grades" title={false} id={gradeId} mutationOptions={{onSuccess}} mutationMode='pessimistic'>
                <SimpleForm>
                    <TextInput source="name"/>
                    <TextInput source="code" validate={[unique()]}/>
                </SimpleForm>
            </Edit>
        </Box>
    )
}