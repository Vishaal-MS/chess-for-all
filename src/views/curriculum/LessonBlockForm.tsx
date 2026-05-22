import { Button } from "react-admin";
import { openDialog, remoteLog, swanAPI } from "@mahaswami/vc-frontend"
import { Box, Input, Typography,TextField, useMediaQuery, IconButton } from "@mui/material";
import { CBDiagram } from "../../fields/ai_lesson/CBDiagram";
import {
  clearAnimation,
  clearBubblesAndCheckMark,
  clearChessBoards,
  loadChessBoards
} from "../../fields/ai_lesson/ai_lesson_utils";
import {useEffect, useRef, useState} from "react";
import { useNotify} from "react-admin";
import {AdvanceForm} from "./lesson_blocks";
import { LessonBlockField } from '../../fields/ai_lesson/lesson_block_field';
import {useLocation, useNavigate} from "react-router-dom";
import { SnippetsLibraryLookup} from "./SnippetsLibraryLookup.tsx";
import { ThumbDown, ThumbUp } from "@mui/icons-material";
import { getUserId } from "../../backend/common_logics.ts";
import { aiBlockLogCreate } from "../../backend/aiBlockLogs.ts";
import {SetupBoard} from "./SetupBoard.tsx";
import {AiBlockFeedBackDialog} from "../ai_block_logs/AiBlockLogDialogs.tsx";

export const LessonBlockForm = ({onSaveBlock, recordData, formMode}) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const notify = useNotify();
    const navigate = useNavigate();
    const location = useLocation();
    const userId = getUserId();
    const params = new URLSearchParams(location.search);
    const paramMode = params.get("param");
    const[name, setName] = useState(recordData?.name || "");
    const[lessonBlockDescription, setLessonBlockDescription] = useState(recordData?.block_description || "");
    const[tagIds, setTagIds] = useState(recordData?.tag_ids || "");
    const showAiForm = paramMode === "AI_NEW" || !paramMode && formMode === "AI_NEW" || formMode === "AI_EDIT" || formMode === "AI_ON_THE_FLY";
    const isAiOntheFly = formMode === "AI_ON_THE_FLY";
    const showAdvanceForm = paramMode === "ADVANCE_NEW";
    const createAIBlock = paramMode === "AI_NEW";
    const editAIForm = formMode === "AI_EDIT";
    const isXLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));
    const loadEmptyBoard = paramMode || formMode === "AI_ON_THE_FLY" || !paramMode && formMode === "AI_NEW";
    const [showFeedbackButton, setShowFeedbackButton] = useState(false);
    const [aiBlockLog, setAiBlockLog] = useState();
    const [state, setState] = useState({
        record: {} as any,
        show_preview: false,
        loading: false,
        isSaving:false,
        showDefaultPreview : false,
        saveButtonDisable: false,
    });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(()=> {
        if (loadEmptyBoard) {
          clearAnimation();clearBubblesAndCheckMark();
          setTimeout(loadChessBoards, 1000);
        }
        setState({...state,showDefaultPreview: true});
        return() => {
            if(formMode !== "AI_ON_THE_FLY") {
              clearChessBoards()
            }
        }
    },[]);

    useEffect(() => {
        if (recordData?.name !== name && (record.block_description === lessonBlockDescription || recordData?.block_description === lessonBlockDescription))
            setState((prev) => ({...prev, saveButtonDisable: false}));
        else
            setState((prev) => ({...prev, saveButtonDisable: true}));
    }, [lessonBlockDescription, name]);

    const setSampleBlockRecord = (sampleRecord: Record<string, any>) => {
        sampleRecord.block_type = sampleRecord.type ? sampleRecord.type.trim().toLowerCase().replace(' ', '_') : '';
        sampleRecord.block_description = sampleRecord.content;
        setName(sampleRecord.board_title);
        setLessonBlockDescription(sampleRecord.block_description);
        setTagIds(sampleRecord.tag_ids);
        setShowFeedbackButton(false);
        setTimeout(loadChessBoards, 1000);
        if (sampleRecord.board_title || sampleRecord.board_subtitle || sampleRecord.starting_board ||
            sampleRecord.goals || sampleRecord.additional_visuals || sampleRecord.animated_tutorial) {
            setState({...state, showDefaultPreview: false, show_preview: true, record: sampleRecord});
        } else {
            setState({...state, showDefaultPreview: true, show_preview: false, record: sampleRecord});
        }
    };

    const  populateTempRecord = (tempRecord, lessonBlockValues = {} as any, aiResponse = {} as any) => {
        const getValue = (key, fallbackKey = key) => {
            if (aiResponse[key] !== undefined && aiResponse[key] !== null) {
                return aiResponse[key];
            }
            return lessonBlockValues?.[fallbackKey];
        };
        tempRecord.board_title = getValue('data-title', 'board_title');
        tempRecord.board_subtitle = getValue('data-caption', 'board_subtitle');
        tempRecord.starting_board = aiResponse['data-pos'] ?? aiResponse['data-fen'] ?? lessonBlockValues?.starting_board;
        const aiDataAnim = aiResponse['data-anim'] ? aiResponse['data-anim'].replace(/\nnarrow:/g, '\narrow:') : aiResponse['data-anim'];
        tempRecord.animated_tutorial = aiDataAnim ?? lessonBlockValues?.animated_tutorial;
        tempRecord.is_game_engine_active = aiResponse['data-anim'] != ''  || aiResponse['data-choice'] != '' || aiResponse['data-goals'] != '' ? true : !!lessonBlockValues?.is_game_engine_active;
        tempRecord.question = lessonBlockValues?.question;
        tempRecord.expected_answer = lessonBlockValues?.expected_answer;
        tempRecord.number_of_lines = lessonBlockValues?.number_of_lines ? parseInt(lessonBlockValues?.number_of_lines) : null;
        tempRecord.is_hide_board = !!lessonBlockValues?.is_hide_board;
        tempRecord.number_of_words = lessonBlockValues?.number_of_words ? parseInt(lessonBlockValues?.number_of_lines) : null;
        // We don't need to update voice over fields here so we deleted it before update.
        delete tempRecord.sound_attachment_file_id;
        delete tempRecord.sound_message_keys;
        delete tempRecord.sound_sprites_json;
        delete tempRecord.sound_attachment_file_name

        if (aiResponse['data-choice']) {
            const choices = JSON.parse(aiResponse['data-choice']);
            tempRecord.choice_title = choices.title;
            tempRecord.choice_hint = choices.hint;

            for (let i = 1; i <= 3; i++) {
                const choice = choices.entries[i - 1];
                if (!choice) continue;
                tempRecord[`choice_${i}_text`] = choice.text;
                tempRecord[`choice_${i}_feedback`] = choice.feedback;
                tempRecord[`is_choice_${i}_correct`] = choice.correct;
            }
        } else {
            for (let i = 1; i <= 3; i++) {
                tempRecord[`choice_${i}_text`] = lessonBlockValues?.[`choice_${i}_text`];
                tempRecord[`choice_${i}_feedback`] = lessonBlockValues?.[`choice_${i}_feedback`];
                tempRecord[`is_choice_${i}_correct`] = !!lessonBlockValues?.[`is_choice_${i}_correct`];
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
        }
        else if (aiResponse['data-help']) {
            tempRecord.block_type = "guided_exercise";
        } else if (aiResponse['data-goals']) {
            tempRecord.block_type = "exercise";
        }
        else if (aiResponse['data-anim']) {
            tempRecord.block_type = "animated_tutorial";
        }
        else {
            tempRecord.block_type = lessonBlockValues?.block_type;
        }
        tempRecord.name = showAiForm ? tempRecord.board_title : name;
        tempRecord.block_description = lessonBlockDescription;
        tempRecord.tag_ids = showAiForm ? tagIds : (lessonBlockValues?.tag_ids ? JSON.parse(lessonBlockValues?.tag_ids) : null);

        return tempRecord;
    }

    const validateForm = (lessonBlockValues = {} as any) => {

        const errors = [];

        if (showAdvanceForm) {
            const isPgnBlock = lessonBlockValues.block_type === 'pgn';
            if (!name.trim()) {
                errors.push("Name");
            }
            if (!lessonBlockValues.block_type) {
                errors.push("Block Type");
            }
            if (isPgnBlock) {
                if (!lessonBlockValues.pgn.trim()) {
                    errors.push("PGN field");
                }
            } else if (!lessonBlockValues.is_hide_board) {
                if (lessonBlockValues.block_type !== "pqa" && !lessonBlockValues.board_title?.trim()) {
                    errors.push("Board Title");
                }
            }
        } else if (showAiForm) {
            if (!lessonBlockDescription.trim()) {
                errors.push("Block Description");
            }
        }
        if (errors.length > 0) {
            notify(`Please enter: ${errors.join(", ")}`, { type: 'error' });
            return false;
        }
        setState({ ...state, loading: true, show_preview: false, showDefaultPreview: false});
        clearChessBoards();
        return true;
    }


    const genBlock = async () => {

        const tempRecord = editAIForm ? recordData : {id: -1000} as any;
        for (let key in tempRecord) {
            if (key !== 'id' && !key.endsWith('_id') && !key.endsWith('_ids')) {
                tempRecord[key] = '';
            }
        }
        let validate, aiResponse, isAiError = false;
        if (showAdvanceForm) {
            const lessonBlockForm = document.getElementById("lesson_block");
            const formData = new FormData(lessonBlockForm);
            const lessonBlockValues = Object.fromEntries(formData.entries());
            validate = validateForm(lessonBlockValues);
            if (validate) {
                populateTempRecord(tempRecord, lessonBlockValues, {});
            }
        } else if (showAiForm) {
            validate= validateForm({});
            let temp = undefined;
            try {
                if (validate) {
                    const body = {
                        prompt: lessonBlockDescription,
                    }
                    temp = await swanAPI("generate_ai_lesson_block", body);
                    const jsonAiResponse = JSON.parse(temp.response);
                    aiResponse = {response: temp.response, usage: JSON.stringify(temp.usage)};
                    populateTempRecord(tempRecord, {}, jsonAiResponse);
                }
            } catch (error) {
                const errorResponse = temp && temp.response?  temp.response : JSON.stringify("AI response is empty");
                const errorUsage = JSON.stringify(temp && temp.usage ? temp.usage : "AI usage is empty");
                isAiError = true;
                aiResponse = {response: errorResponse, usage: errorUsage, stackTrace: JSON.stringify(error)};
                console.error("Error generating block: ", error);
                notify("Error generating block. Try again" , {type: "error"});
            }
        }
        if(validate) {
            setState({record: tempRecord, show_preview: true, loading: false});
            if (showAiForm) {
                if (createAIBlock) {
                    setName(tempRecord.name);
                }
                await createAiBlockLog(tempRecord.name, aiResponse, isAiError);
            }
            setTimeout(loadChessBoards, 1000);
        }

    }
    const { record , show_preview, showDefaultPreview, isSaving, saveButtonDisable} = state;

    const saveBlock = async () => {

        if(showAiForm) {
            if (!name.trim()) {
                notify("Please enter Name", {type: "error"});
                return;
            }
        }
        setState({ ...state, isSaving: true });
        //remove id from record before saving
        let recordToSave = { ...record };

        for (let key in recordToSave){
            if(recordToSave[key] === undefined){
                recordToSave[key] = '';
            }
        }
        if(!recordToSave?.id) {
            recordToSave = recordData;
        }

        let id;
        recordToSave.name = name;
        try {
            if (editAIForm) {
                const {data: lessonBlock} = await dataProvider.update('lesson_blocks', {id: recordToSave.id, data: recordToSave});
                id = lessonBlock.id;
            } else {
                delete recordToSave.id;
                recordToSave.type = undefined;
                recordToSave.title = undefined;
                recordToSave.content = undefined;
                recordToSave.position_number = undefined;
                recordToSave.is_advanced = undefined;
                recordToSave.is_active = undefined;
                console.log("Lesson block data: ", recordToSave);
                const {data: lessonBlock} = await dataProvider.create('lesson_blocks', {data: recordToSave});
                if (aiBlockLog)
                    await dataProvider.update('ai_block_logs', {id: aiBlockLog?.id, data: {name: name, lesson_block_id: lessonBlock?.id}});
                id = lessonBlock.id;
                //Get the new record id
                if (formMode === "AI_ON_THE_FLY")
                    onSaveBlock(lessonBlock);
            }
        } catch (error) {
            remoteLog("Error sending on LessonBlockForm saveBlock method");
        }
        setState({ ...state, isSaving: false });

        if (formMode !== "AI_ON_THE_FLY")
            navigate(`/lesson_blocks/${id}/show`);
    }
    let cbDiagramSize = '70%/max=334';

    if (isAiOntheFly) {
        cbDiagramSize = '70%/max=290';
    }
    if (isXLargeScreen) {
        cbDiagramSize = '70%/max=800';
    }

    const createAiBlockLog = async(name, aiResponse, isAiError) => {
        const aiBlockLog = await aiBlockLogCreate(name, lessonBlockDescription, aiResponse, isAiError, userId);
        setAiBlockLog(aiBlockLog);
        setShowFeedbackButton(true);
    }

    const handleFeedback = (liked: boolean) => {
        try {
            if (!liked) {
                openDialog(<AiBlockFeedBackDialog aiBlockLog={aiBlockLog} hideFeedBackButtons={() => setShowFeedbackButton(false)}/>);
            } else {
                dataProvider.update("ai_block_logs", {id: aiBlockLog?.id, data: {feedback_status: true}})
                notify("Thank you for your feedback", {type: "success"});
                setShowFeedbackButton(false);
            }
        } catch (error) {
            remoteLog("Error sending on LessonBlockForm handleFeedback method: ", error);
        }
    }
    
  return (
        <>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                height: isAiOntheFly ? 'calc(88vh - 5rem)' : editAIForm ? 'calc(95vh - 4rem)' : 'calc(100vh - 4rem)',
                padding: isAiOntheFly ? 0 : 1,
                gap: 1,
                boxSizing: 'border-box'
            }}>

                <Box sx={{ flex: 1.75,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: 1,
                    backgroundColor: (theme) => theme.palette.background.paper,
                    overflow: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    <Box>
                        {showAdvanceForm && 
                            <TextField sx={{mt: -0.1}}
                                required
                                id="name"
                                label="Name"
                                variant="filled"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        }
                        {showAdvanceForm && <AdvanceForm /> }
                        {showAiForm && <Box display="flex" sx={{
                            borderBottom: (theme) => `2px solid ${theme.palette.grey.A400}`,
                        }}>
                            <Box flex={1}>
                                <Input
                                    inputRef={inputRef}
                                placeholder={"Tap the snippets library to explore and try ready made samples"}
                                id="block_description"
                                multiline
                                disableUnderline
                                sx={{
                                    width: '100%', mb: 0, overflow: 'auto',
                                    scrollbarWidth: 'none',
                                    height: isAiOntheFly ? 'calc(90vh - 10rem)' : editAIForm ? 'calc(97vh - 10rem)' : 'calc(97vh - 8rem)',
                                    alignItems: 'flex-start',
                                }}
                                disabled={state.loading}
                                value={lessonBlockDescription}// Disable input while loading
                                onChange={(e) => {
                                setLessonBlockDescription(e.target.value);}
                                } // Hide preview on text change
                                />
                            </Box>
                            <Box display={"flex"} alignItems={"flex-start"} flexDirection={"column"}>
                                <SnippetsLibraryLookup setSample={setSampleBlockRecord}/>
                                <SetupBoard
                                    inputRef={inputRef}
                                    inputValue={lessonBlockDescription}
                                    setInputValue={setLessonBlockDescription}/>
                            </Box>
                        </Box>}
                    </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <Button
                                variant="contained"
                                onClick={genBlock}
                                label={state.loading ? "Generating Preview..." : "Generate Preview"}
                                disabled={state.loading} // Disable button while loading
                            />
                        </Box>

                    {/* Optionally, show a spinner next to or instead of the button text */}
                    {/* {state.loading && <CircularProgress size={24} sx={{ ml: 1 }} />} */}
                </Box>
                <Box sx={{ flex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: 1,
                    backgroundColor: (theme) => theme.palette.background.paper,
                    overflow: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    <Box>
                        {((showAiForm && show_preview) || editAIForm) && 
                            <TextField sx={{mt: -0.1}}
                                required
                                id="name"
                                label="Name"
                                variant="filled"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        }
                        {showDefaultPreview && loadEmptyBoard &&
                            <Typography variant="h6" mb={0} gutterBottom align={"center"}>
                                Preview
                            </Typography>
                        }
                    </Box>
                    <Box>
                        {showDefaultPreview && editAIForm && <LessonBlockField maxSize={cbDiagramSize}  source="animated_tutorial" /> }
                        {showDefaultPreview && loadEmptyBoard && <CBDiagram  record={{}} maxSize={cbDiagramSize} />}
                        {show_preview && <CBDiagram record={record} maxSize={cbDiagramSize} />}
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: showAiForm ? -1 : 1 }}>
                            {show_preview && showFeedbackButton &&
                                <IconButton disabled={!show_preview} sx={{mx: 1}} color="error" onClick={() => handleFeedback(false)}><ThumbDown/></IconButton>}
                            <Button variant={"contained"} sx={{align: "center"}}
                                onClick={saveBlock}
                                loading={isSaving}
                                label={onSaveBlock ? "Insert Block" : "Save Block"} disabled={(!show_preview && !editAIForm) || saveButtonDisable}
                            />
                            {show_preview && showFeedbackButton &&
                                <IconButton disabled={!show_preview} sx={{mx: 1}} color="info" onClick={() => handleFeedback(true)}><ThumbUp/></IconButton>}
                        </Box>
                        <Box>
                            {show_preview && showFeedbackButton &&
                                <div className={'diagText'}>
                                    This block can be inaccurate; please review for accuracy.
                                </div>}
                        </Box>
                    </Box>

                </Box>  
            </Box>
        </>
    );
}

/* 

TODO:

a) ai is adding masala text 

Demo scenario 1

create a tutorial

Start with white king in e4 and 

Animate:

1. highlight squares around e4
2. move white king to e5
3. move white king to e6
4. move white king to e7
4. move white king to e8
6. show bubble "this is good stuff with emoji of happy face" at a3
7. wait for 1 second
8. clear all
9. show bubble "cleared everything with emoji of broom" at a6
10. draw blue line on rank 5
11. wait for 5 seconds
12. clear all again

Demo scenario 1b

create a tutorial

start with white king in e4

Animate:

1. highlight squares around e4
2. move white king to e5
3. show bubble 'now king moved forward happily with happy face emoji'
4. wait for 3 seconds
5. clear the board of animations

Demo 2

Create an exercise with hints. 
Position wKh1,Qe6,Nh6,Rd1,Pg3,h2/bKh8,Qb4,Ra8,Nb7,Pg7,h7. 
Title 'Smothered Mate Prep'. 
Legend 'Sacrifice the queen'. 

Help 'Sacrifice queen to lure rook /bubble:g8'.

Goals:
- If white plays Qg8: VERYHAPPY feedback 'Decisive sacrifice!$g8', continue.
- If black plays RxQ: SICK feedback 'King trapped.$h8', continue.
- If white mates with Nf7: SMILE feedback 'Excellent, suffocated!$f7', success.
- If white plays badly (eval equal/black better): ROLLINGEYES feedback 'Could have mated by force.', stop.


Demo 2a

Create an exercise with hints titled Smothered Mate Prep and legend Sacrifice the queen
Position wKh1,Qe6,Nh6,Rd1,Pg3,h2/bKh8,Qb4,Ra8,Nb7,Pg7,h7. 

Help 'Sacrifice queen to lure rook /bubble:g8'.

Goals:
- If white plays Qg8: show feedback 'Decisive sacrifice' on g8 with icon VERYHAPPY and continue.
- If black plays RxQ: feedback 'King trapped' on  h8, and icon SICK and continue.
- If white mates with Nf7: feedback 'Excellent, suffocated' on f7 and icon SMILE and success.
- If white plays badly (eval equal/black better): feedback 'Could have mated by force.' with icon and stop.

Demo 2b

Create an exercise with hints titled Smothered Mate Prep and legend Sacrifice the queen
Position wKh1,Qe6,Nh6,Rd1,Pg3,h2/bKh8,Qb4,Ra8,Nb7,Pg7,h7. 

Help 'Sacrifice queen to lure rook /bubble:g8'.

Goals:

Continue

- If white plays Qg8: show feedback 'Decisive sacrifice' on g8 with icon VERYHAPPY 
- If black plays RxQ: feedback 'King trapped' on  h8, and icon SICK

Success

- If white mates with Nf7: feedback 'Excellent, suffocated' on f7 and icon SMILE

Stop

- If white plays badly (eval equal/black better): feedback 'Could have mated by force.' with icon ROLLINGEYES

Demo 2c

Create an exercise with hints titled Smothered Mate Prep and legend Sacrifice the queen
Position wKh1,Qe6,Nh6,Rd1,Pg3,h2/bKh8,Qb4,Ra8,Nb7,Pg7,h7. 

Help 'Sacrifice queen to lure rook /bubble:g8'.

Goals:

Continue

- If white plays Qg8: show feedback 'Decisive sacrifice and emoji of very happy face' on g8 
- If black plays RxQ: feedback 'King trapped' on  h8, and icon SICK

Success

- If white mates with Nf7: feedback 'Excellent, suffocated and emoji of smiling face' on f7 

Stop

- If white plays badly (eval equal/black better): feedback 'Could have mated by force. and emoji of rolling eyes'


Demo 3

Make a multiple-choice question titled Mate or Not 

Position wKg2,Qf8,Pf2,g3,h2/bKc8,Qb6,Pa7,b7,c7

Ask Is Black mated?

Option 1: 'No, the king has an escape square.' (correct), Feedback: Correct. The king can escape via d7
Option 2: 'Yes, that is a back rank mate.', Feedback: No, Black has the escape square d7

*/
