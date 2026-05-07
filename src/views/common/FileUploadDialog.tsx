import { Typography, Button, Box } from "@mui/material";
import { closeDialog, openDialog, SimpleFileInput } from "@mahaswami/vc-frontend";
import { Create, SimpleForm } from "react-admin";

export const FileUpload = (props) => {
    
    const onOk = async () => {
        const el = document.querySelector('input#simple-file-upload-input');
        const fileUpload = el?.files;
        console.log("File Upload:", fileUpload);
        closeDialog();
        props.okFn(fileUpload);
    }
    const onCancel = () => {
        closeDialog();
        props.cancelFn(true)
    }
    //TODO: need to find a different dummy resource than lessons.

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{props.title}</Typography>
            <Create resource="lessons" sx={{ mb: 3 }}>   
                <SimpleForm toolbar={false}>
                    <SimpleFileInput source="name" id="simple-file-upload-input"
                        label={props.label}
                        fullWidth 
                        />
                </SimpleForm>
            </Create>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={onOk}
                >
                    {props.okButtonText}
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </Box>
        </Box>
    )
}  

export const fileUploadPrompt = (title = "Please provide Input", 
  label = "Choose a File To Upload", okButtonText = "OK"): Promise<string> => {
  return new Promise((resolve) => {
  openDialog(
    <FileUpload
    title={title}
    label={label}
    okButtonText={okButtonText}
    okFn={(file: any) => {
      closeDialog();
      resolve({ files: file, isCanceled: false });
    }}
    cancelFn={(isCanceled) => resolve({ isCanceled })}
    />,
    {onClose: () => resolve({ isCanceled: true })},
  );
  });
}