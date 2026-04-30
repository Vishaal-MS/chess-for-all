import {Box, Grid, Input, Typography} from '@mui/material';
import { useState } from "react";
import { closeDialog, remoteLog } from "@mahaswami/vc-frontend";
import { UserRoles } from "../../helpers/constants";
import { sendEmail } from "../../businessLogic";
import { getAiBlockFeedbackEmailTemplate } from "../../helpers/emailTemplates";
import SendIcon from '@mui/icons-material/Send';
import { Button, useNotify, useRefresh } from 'react-admin';

export const AiBlockFeedBackDialog = ({aiBlockLog, hideFeedBackButtons}) => {
   
   const notify = useNotify();
   const dataProvider = window.swanAppFunctions.dataProvider;
   const [feedbackText, setFeedbackText] = useState();

   const handleSendFeedback = async() => {
      try {
         closeDialog();
         hideFeedBackButtons();
         dataProvider.update("ai_block_logs", {id: aiBlockLog.id, data: {feedback_text: feedbackText, feedback_status: false}});
         notify("Thank you for your feedback", {type: "success"});
         await sendFeedbackEmail(aiBlockLog);
      } catch (error) {
         remoteLog("Error sending on handleSendFeedback: ", error);
      }
   }

   const sendFeedbackEmail = async(blockDetails) => {
      try {
         const {data: superAdmins} = await dataProvider.getList("users", {
            filter: {role: UserRoles.SUPER_ADMIN},
            meta: {scopingEscapeHatch: true},
            pagination: {page: 1, perPage: 1000}
         })
         const emails = superAdmins.map((user) => user.email);
         const messageTemplate = getAiBlockFeedbackEmailTemplate(blockDetails, feedbackText);
         if (emails.length > 0) {
            sendEmail({to: emails, ...messageTemplate});
         }
      } catch (error) {
         remoteLog("Error sending on sendFeedbackEmail: ", error);
      }
   }
   
   return (
      <Box>
         <Typography variant="body1">Feedback</Typography>
         <Input
            placeholder={"Enter your Feedback"}
            multiline
            disableUnderline
            sx={{
               width: '100%', mb: 0, overflow: 'auto',
               border: '2px solid #b4b4b4',
               scrollbarWidth: 'none',
               padding: '5px',
               borderRadius: '5px',
               height: '25vh',
               alignItems: 'flex-start',
            }}
            onChange={(e) => setFeedbackText(e.target.value)}
         />
         <Button label="send" 
            variant="contained" 
            sx={{float: 'right', mt: 2}} 
            endIcon={<SendIcon/>}
            onClick={handleSendFeedback} />
      </Box>
      
   );
}

export const AiBlockLogNoteDialog = ({record}) => {
   const refresh = useRefresh();
   const notify = useNotify();
   const [note, setNote] = useState(record?.notes);
   const dataProvider = window.swanAppFunctions.dataProvider;

   const handleSave = async(id) => {
      try {
         await dataProvider.update("ai_block_logs", {id: id, data: {notes: note}});
         closeDialog();
         notify("Notes added successfully", {type: "success"});
         refresh();
      } catch (error) {
         remoteLog("Error sending on AiBlockLogNoteDialog handleSave method");
      }
   }
   return (
      <Grid container>
         <Grid md={12}>
            <Typography>Notes</Typography>
            <Input
               value={note}
               placeholder={"Enter your Feedback"}
               multiline
               rows={8}
               disableUnderline
               sx={{
                  width: '100%',
                  mb: 0, overflow: 'auto',
                  border: '2px solid #b4b4b4',
                  scrollbarWidth: 'none',
                  padding: '5px',
                  borderRadius: '5px',
                  alignItems: 'flex-start',
               }}
               onChange={(e) => setNote(e.target.value)}/>
            </Grid>
            <Grid md={12}>
               <Button 
                  label="save"
                  variant="contained" 
                  sx={{float: 'right', mt: 2}}  
                  onClick={() => handleSave(record.id)}/>
            </Grid>
         </Grid>
   );
}