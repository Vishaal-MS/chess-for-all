import { openDialog } from "@mahaswami/vc-frontend";
import { BooleanField, Button, DateField, FunctionField, Labeled,
    ReferenceField,
    Show, SimpleShowLayout, TextField, useRecordContext
} from "react-admin";
import { Grid, Box, Input, useMediaQuery } from "@mui/material";
import NoteIcon from '@mui/icons-material/StickyNote2';
import { LessonBlockField } from "../../fields/ai_lesson/lesson_block_field";
import { AiBlockLogNoteDialog } from "./AiBlockLogDialogs";
import {UsersReferenceField} from "../users.tsx";

export const AiBlockLogShow = () => {

   const NoteButton = () => {
      const record = useRecordContext();
      const handleNote = () => {openDialog(<AiBlockLogNoteDialog record={record}/>)};
      
      return (
         <Button label="Notes" variant="contained" startIcon={<NoteIcon/>} onClick={handleNote}/>);
   }

   const jsonFormatter = (input) => {
      if ((input && input.toString() === "[object Object]") || input === undefined)
         return null;
      const parsedValue = JSON.parse(input);
      return JSON.stringify(parsedValue, null, 2);
   };

   const boxStyle = { p: 1, mr: 1,  height: '100%', overflow: 'auto', 
      scrollbarWidth: 'none', border: '0.1rem solid #ccc', borderRadius: '0.5rem' 
   }

   const ErrorField = () => {
      const record = useRecordContext();

      const showStackTrace = () => {
         if (record?.is_ai_error)
            openDialog(<JsonFunctionField label="Stack Trace" name="stack_trace" record={record} width="60vw"/>);
      }

      return (
         <Labeled label="Is Error">
            <BooleanField source="is_ai_error" onClick={showStackTrace}/>
         </Labeled>
      )
   }

   const JsonFunctionField = ({label, name, record}: {label: string, name: string, record?: any}) => (  
      <Grid item md={6} sx={{overflow: 'auto', scrollbarWidth: 'none'}}>
         <Box sx={boxStyle}>
            <Labeled label={label} sx={{width: '100%'}}>
               <FunctionField sx={{width: '100%'}} record={record}
                  render={record => {
                     const formattedValue = jsonFormatter(record[name]);
                     return <Input
                           readOnly
                           multiline
                           disableUnderline
                           value={formattedValue}
                           sx={{
                              overflow: "auto",
                              width: '100%',
                              scrollbarWidth: "thin",
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              whiteSpace: 'pre-wrap',
                           }}
                     />
                  }}
               />
            </Labeled>
         </Box>
      </Grid>
   )

   return (
      <Show resource="ai_block_logs">
         <SimpleShowLayout >
            <Grid container>
               <Grid item md={3}>
                  <Labeled label="Log Timestamp">
                     <DateField source="log_timestamp" showTime/>
                  </Labeled>
               </Grid>
               <Grid item md={4}>
                  <Labeled label="Tenant">
                     <ReferenceField reference="tenants" source="tenant_id" link={false}>
                        <TextField source="name"/>
                     </ReferenceField>
                  </Labeled>
               </Grid>
               <Grid item md={4}>
                  <Labeled label="User">
                     <UsersReferenceField source="user_id" link={false} />
                  </Labeled>
               </Grid>
               <Grid item md={1}><NoteButton/></Grid>
            </Grid>
            <Grid container>
               <Grid item md={3}>
                  <Labeled label="Feedback Status">
                     <BooleanField source="feedback_status" />
                  </Labeled>
               </Grid>
               <Grid item md={4}>
                  <ErrorField />
               </Grid>
               <Grid item md={4}>
                  <Labeled label="Is Archived">
                     <BooleanField source="is_archived" />
                  </Labeled>
               </Grid>
            </Grid>
            <Grid container>
               <JsonFunctionField label="AI Response" name="ai_response" />
               <JsonFunctionField label="AI Usage" name="ai_usage" />
            </Grid>
            <Grid container>
               <Grid item md={6}>
                  <Box sx={boxStyle}>
                     <Labeled label="Feedback">
                        <TextField source="feedback_text"/>
                     </Labeled>
                  </Box>
               </Grid>
               <Grid item md={6}>
                  <Box sx={boxStyle}>
                     <Labeled label="Notes">
                        <TextField source="notes"/>
                     </Labeled>
                  </Box>
               </Grid>
            </Grid>
         </SimpleShowLayout>
         <ShowAiResponceBlock />
      </Show>
   )
}

const ShowAiResponceBlock = () => {
    const record = useRecordContext();
    if(!record || record === undefined) return;

    const jsonFormatter = (input) => {
         if (input === "[object Object]" || input === undefined)
            return null;
         const parsedValue = JSON.parse(input);
         return parsedValue;
   };

    const {user_command, ai_response} = record as any;
    const aiResponce = jsonFormatter(ai_response);
    const tempRecord = {id: -1000};
    const boardData = populateTempRecord(tempRecord, {}, aiResponce, user_command);
    const isXLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));
    const maxBoardSize = isXLargeScreen ? '80%/max=550' : '80%/max=380'
    const boxStyle = {
      p: 1,
      overflow: 'auto',
      scrollbarWidth: 'none',
      border: '0.1rem solid #ccc',
      borderRadius: '0.5rem',
      height: '85vh'
    }

    return (
        <>  
            <SimpleShowLayout>
               <Grid container>
               <Grid item md={6}>
                  <Labeled label="Name"><TextField source="name"/></Labeled>
               </Grid>
               <Grid item md={6}>
                  <Labeled label="Block Type"><TextField source="block_type" record={boardData}/></Labeled>
               </Grid>
            </Grid>
            </SimpleShowLayout>
            <Labeled label="User Command And Board" sx={{width: '100%', p: 2}}>
            <Grid container sx={{mx: 0}}>
               <Grid item md={6} sx={{overflow: 'auto', scrollbarWidth: 'thin'}}>
               <Box sx={{ ...boxStyle, mr: 1 }}>
                    <Input
                        placeholder={"User Comment"}
                        id="block_description"
                        multiline
                        disableUnderline
                        sx={{
                           p: 1,
                            width: "100%",
                            overflow: "auto",
                            height: "100%",
                            scrollbarWidth: "none",
                            alignItems: 'flex-start',
                        }}
                        readOnly
                        value={user_command}
                    />
               </Box>
               </Grid>
               <Grid md={6} sx={boxStyle}>
                    <Box mt={2}>
                        <LessonBlockField label="Board" record={boardData} maxSize={maxBoardSize}/>
                    </Box>
                </Grid>
            </Grid>
            </Labeled>
        </>
    );
}

const populateTempRecord = (tempRecord, lessonBlockValues = {} as any, aiResponse = {} as any, blockDiscription = {} as any) => {

   if (aiResponse === null) return; 

    const getValue = (key, fallbackKey = key) => {
        if (aiResponse[key] !== undefined && aiResponse[key] !== null) {
            return aiResponse[key];
        }
        return lessonBlockValues?.[fallbackKey];
    };
    tempRecord.board_title = getValue('data-title', 'board_title');
    tempRecord.board_subtitle = getValue('data-legend', 'board_subtitle');
    tempRecord.starting_board = aiResponse['data-pos'] ?? aiResponse['data-fen'] ?? lessonBlockValues?.starting_board;
    tempRecord.animated_tutorial = aiResponse['data-anim'] ?? lessonBlockValues?.animated_tutorial;
    tempRecord.is_game_engine_active = aiResponse['data-anim'] || aiResponse['data-choice'] || aiResponse['data-goals'] ? true : lessonBlockValues?.is_game_engine_active;

    if (aiResponse['data-choice']) {
        const choices = JSON.parse(aiResponse['data-choice']);
        tempRecord.choice_title = choices.title;
        tempRecord.choice_hint = choices.hint;

        for (let i = 1; i <= 3; i++) {
            const choice = choices.entries[i - 1];
            if (!choice) continue;
            tempRecord[`choice_${i}_text`] = choice.text;
            tempRecord[`choice_${i}_feedback`] = choice.feedback;
            tempRecord[`is_choice_${i}_correct`] = choice.correct ? 'TRUE' : 'FALSE';
        }
    } else {
        for (let i = 1; i <= 3; i++) {
            tempRecord[`choice_${i}_text`] = lessonBlockValues?.[`choice_${i}_text`];
            tempRecord[`choice_${i}_feedback`] = lessonBlockValues?.[`choice_${i}_feedback`];
            tempRecord[`is_choice_${i}_correct`] = lessonBlockValues?.[`is_choice_${i}_correct`];
        }
        tempRecord.choice_title = lessonBlockValues?.choice_title;
        tempRecord.choice_hint = lessonBlockValues?.choice_hint;
    }

    tempRecord.help = getValue('data-help', 'help');
    tempRecord.solution = lessonBlockValues?.solution;
    tempRecord.additional_visuals = lessonBlockValues?.additional_visuals;
    tempRecord.pgn = lessonBlockValues?.pgn;
    tempRecord.goals = getValue('data-goals', 'goals');

    if (aiResponse['data-choice']) {
        tempRecord.block_type = "mcq";
    } else if (aiResponse['data-help']) {
        tempRecord.block_type = "guided_exercise";
    } else if (aiResponse['data-goals']) {
        tempRecord.block_type = "exercise";
    } else if (aiResponse['data-anim']) {
        tempRecord.block_type = "animated_tutorial";
    } else {
        tempRecord.block_type = lessonBlockValues?.block_type;
    }
    tempRecord.name = tempRecord.board_title;
    tempRecord.block_description = blockDiscription;

    return tempRecord;
}