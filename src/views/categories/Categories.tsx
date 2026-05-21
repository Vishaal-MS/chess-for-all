import {
    Button, Create,
    Edit, List,
    SimpleForm,
    TextInput, TopToolbar,
    useNotify, useUnique
} from "react-admin"
import {closeDialog, DataTable, openDialog, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {Box, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {isSuperAdmin} from "../../businessLogic.ts";

export const CategoryList = ({standardId}) => {
    const superAdmin = isSuperAdmin();
    const showCategoryDialog = (id) => {
        openDialog(<CategoryEdit categoryId={id}/>)
    }

    const CreateCategoryToolBar = () => {
        const createCategoryDialog = () => (
            openDialog(<CategoryCreate standardId={standardId}/>)
        )
        return (
            <TopToolbar>
                <Button startIcon={<AddIcon/>} label={"Create Category"} onClick={createCategoryDialog}/>
            </TopToolbar>
        )
    }

    return(
        <List resource="standard_categories" title={standardId ? false : "Categories" } filter={{standard_id: standardId}}
              exporter={false} actions={superAdmin ? <CreateCategoryToolBar /> : false} sx={{width: '100%'}}
              disableSyncWithLocation pagination={<SensibleDefaultPagination />} perPage={PER_PAGE} >
            <DataTable rowClick={superAdmin ? showCategoryDialog : false} bulkActionButtons={false}>
                <DataTable.Col source="name"/>
                <DataTable.Col source="code"/>
            </DataTable>
        </List>
    )
}

export const CategoryCreate = ({standardId}) => {
    const notify = useNotify();
    const onSuccess = async (data: any) => {
        notify('Category details created successfully', { type: 'success' });
        closeDialog();
    }

   return (
      <Box>
         <Typography variant="h6" sx={{pl: 2}}>Create Category</Typography>
         <Create resource="standard_categories" title={false} redirect={false} mutationOptions={{onSuccess}}>
           <CategoryForm standardId={standardId}/>
         </Create>
      </Box>
   )
}

export const CategoryEdit = ({categoryId}) => {
    const notify = useNotify();
    const onSuccess = async (data: any) => {
        notify('Category details updated successfully', { type: 'success' });
        closeDialog();
    }

   return (
      <Box>
         <Typography variant="h6" sx={{pl: 2, pb: 0}}>Edit Category</Typography>
         <Edit resource="standard_categories" title={false} id={categoryId} mutationOptions={{onSuccess}} mutationMode='pessimistic'>
            <SimpleForm>
               <TextInput source="name"/>
               <TextInput source="code"/>
            </SimpleForm>
         </Edit>
      </Box>
   )
}

const CategoryForm = ({standardId}) => {
    const unique = useUnique();
    return(
        <SimpleForm defaultValues={standardId ? {standard_id: standardId} : {}}>
            <TextInput source="name"/>
            <TextInput source="code" validate={[unique()]}/>
        </SimpleForm>
    )
}