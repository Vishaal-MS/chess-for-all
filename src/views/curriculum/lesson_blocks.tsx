import {
    AutocompleteArrayInput,
    BooleanInput,
    Datagrid,
    FormDataConsumer, NumberInput,
    Labeled,
    ReferenceArrayField, ReferenceArrayInput,
    SelectField,
    SelectInput, ShowButton, SingleFieldList,
    TextField,
    useNotify,
    useRecordContext,
    useUpdate,
    WithRecord,
    Confirm
} from 'react-admin';
import {
    Box,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel, MenuItem,
    Select,
    Typography,
    useMediaQuery
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { LessonBlockForm } from "./LessonBlockForm.tsx";
import { Create} from 'react-admin';
import {SimpleShowLayout } from 'react-admin';
import { LessonBlockField } from '../../fields/ai_lesson/lesson_block_field';
import {PER_PAGE, remoteLog, SensibleDefaultPagination } from "@mahaswami/vc-frontend";
import { SearchInput, Button, TopToolbar, Edit, SimpleForm, TextInput} from 'react-admin';
import {useLocation, useNavigate} from "react-router-dom";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { extractMessageAndConstructKeyMap } from '../../utils.ts';
import {voiceChoices, VoiceStatus} from "../../helpers/constants.ts";
import { isAllowedVoiceOver, sendEmail } from '../../businessLogic.ts';
// import { getEmailsBasedOnEnv } from '../../configuration.tsx';
import { GraphicEq } from '@mui/icons-material';
import {generateVoiceOverMessages} from "../../backend/voiceOver.ts";

const LessonBlockListActions = () => {
     const navigate = useNavigate();

    return(
        <TopToolbar>
            <Button startIcon={<AddIcon />} label={"AI Lesson Block"} onClick={() => navigate("/lesson_blocks/create?param=AI_NEW")}/>
            <Button startIcon={<AddIcon />} label={"Advanced Lesson Block"} onClick={() => navigate("/lesson_blocks/create?param=ADVANCE_NEW")}/>
        </TopToolbar>
    );
}
const CustomEmptyList = () => {
    return (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="calc(100vh - 200px)"
    >
        <Typography sx={{color: 'grey'}} variant="h4" gutterBottom>
            No Lesson Blocks yet
        </Typography>
        <LessonBlockListActions/>
    </Box>
)};

export const LessonBlocksList = () => {
    const blockFilters = [
        <SearchInput source="q" alwaysOn />,
        <SelectInput source="block_type" label="Block Type" choices={getBlockTypeChoices()} alwaysOn />,
        <ReferenceArrayInput source="tag_ids" reference="tags" queryOptions={{meta: {scopingEscapeHatch:true}}}
                             perPage={1000} sort={{ field: 'name', order: 'ASC' }} alwaysOn>
            <AutocompleteArrayInput label="Tags" />
        </ReferenceArrayInput>
    ];

    return (
        <SwanList filters={blockFilters}
              actions={<LessonBlockListActions/>} empty={<CustomEmptyList/>} pagination={<SensibleDefaultPagination/>} perPage={PER_PAGE}
              sort={{field: 'name', order: 'ASC'}} exporter={false}>
            <Datagrid>
                <TextField source="name"/>
                <SelectField source="block_type" label="Block Type" choices={getBlockTypeChoices()} />
                <ReferenceArrayField source="tag_ids" reference="tags" label="Tags" perPage={1000}>
                    <SingleFieldList linkType={false} />
                </ReferenceArrayField>
            </Datagrid>
        </SwanList>
    );
}


export const getBlockTypeChoices = () => {
    const choices = [
        { id: 'animated_tutorial', name: 'Animated Tutorial' },
        { id: 'guided_exercise', name: 'Guided Exercise' },
        { id: 'exercise', name: 'Exercise' },
        {id: 'mcq',name: 'MCQ'},
        {id: 'pgn', name: 'PGN'},
        {id: 'pqa', name: 'Plain Question & Answer'},
    ];
    return choices;
};

export const LessonBlockShow = () => {
    const isXLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));
    const maxBoardSize = isXLargeScreen ? '80%/max=550' : '80%/max=340'

    return (
    <SwanShow>
        <SimpleShowLayout sx={{height: '82vh', overflow: 'auto'}}>
            {/* <TextField source="id" /> */}
            <Grid container sx={{display: 'flex', alignItems: 'center'}}>
                <Grid item md={3}>
                    <Labeled label="Name"><TextField source="name" /></Labeled>
                </Grid>
                <Grid item md={3}>
                    <Labeled label="Block Type">
                        <SelectField source="block_type" label="Block Type" choices={getBlockTypeChoices()} />
                    </Labeled>
                </Grid>
            </Grid>
            {/* <TextField source="board_title" />
            <TextField source="board_subtitle" />
            <TextField source="starting_board" /> */}
            {/* <TextField source="animated_tutorial" />             */}
            <LessonBlockField label="Tutorial" source="animated_tutorial" maxSize={maxBoardSize}/>                        
        </SimpleShowLayout>
    </SwanShow>
    )
};

const LessonBlockEditActions = () => {
    const record = useRecordContext();
    const showVoiceOverBtn = record?.block_type !== "pgn" && isAllowedVoiceOver();
    return (
        <TopToolbar sx={{ alignItems: "center"}}>
            {/* TODO: This will not show in lesson content edit ai gen block */}
            {showVoiceOverBtn && <GenerateVoiceButton />}
            <ShowButton/>
        </TopToolbar>
    )
}

export const LessonBlockEdit = () => (
            <Edit mutationMode="pessimistic" actions={<LessonBlockEditActions/>}>
                <WithRecord render={record => {
                    const location = useLocation();
                    const params = new URLSearchParams(location.search);
                    const paramMode = params.get("param");
                    if (!record.block_description || paramMode == "DEBUG_ADVANCED_EDIT") {
                        return <AdvanceForm editForm={true}/>
                    } else {
                        return <LessonBlockForm recordData={record} formMode={"AI_EDIT"}/>
                    }
                }} />
            </Edit>
);


export const LessonBlockCreate = () => (
    <Create>
        <LessonBlockForm formMode={"AI_NEW"}/>
    </Create>
);

const fenStartingBoard = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

const ChoiceCorrect = ({rest, index, data}) => {
    const currentIndex = [1,2,3].find(i => data[`is_choice_${i}_correct`]);

    return <BooleanInput readOnly={currentIndex && currentIndex !== index} source={`is_choice_${index}_correct`} label={`Correct`} {...rest} sx={{p: "0.5rem"}}/> ;
}

const emptyBoard = "8/8/8/8/8/8/8/8";
const BoardFields = (
    <>
        <TextInput required source="board_title" label="Board Title" />
        <TextInput source="board_subtitle" label="Board Subtitle" />
        <TextInput source="starting_board" label="Starting Board" defaultValue={fenStartingBoard}/>
        <BooleanInput source="is_game_engine_active" defaultValue={true} label="Game Engine?" />
        <TextInput multiline source="additional_visuals" label="Additional Visuals" maxRows={8}/>
    </>                                                                                                          
)
export const AdvanceForm = ({editForm}) => (
    <SimpleForm id="lesson_block" sx={{px: editForm ? 2 : 0, padding: editForm ? '1em' : 0}} toolbar={!editForm  ? false : undefined}>
        {editForm && <TextInput required source="name" />}
        <SelectInput required source="block_type" label="Block Type" choices={getBlockTypeChoices()} defaultValue={'pgn'} />
        <ReferenceArrayInput source="tag_ids" reference="tags" queryOptions={{meta: {scopingEscapeHatch: true}}}
                             perPage={1000} sort={{field: 'name', order: 'ASC'}}>
            <AutocompleteArrayInput label="Tags" source="tag_ids"
                onChange={(value) => {
                    const hiddenInput = document.getElementById("tag_ids_hidden");
                    if (hiddenInput) {
                        hiddenInput.value = JSON.stringify(value);
                    }
                }}
            />
        </ReferenceArrayInput>
        <input type="hidden" name="tag_ids" id="tag_ids_hidden" />
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'mcq' && (
                <BooleanInput source="is_hide_board" defaultValue={false} label="Hide Board?" key={"hide_board"} />
            )}
        </FormDataConsumer>
        <FormDataConsumer>
        {({ formData, ...rest }) => formData.block_type == "mcq" && 
            formData.is_hide_board == false && (BoardFields)}
      </FormDataConsumer>
      <FormDataConsumer>
        {({ formData, ...rest }) => !["pgn", "pqa", "mcq"].includes(formData.block_type) && (BoardFields)}
      </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) =>
              formData.block_type === 'animated_tutorial' && (
                <TextInput multiline source="animated_tutorial" label="Animated Tutorial" {...rest} maxRows={8}/>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'guided_exercise' && (
                <>
                    <TextInput multiline source="goals" {...rest} maxRows={8}/>
                    <TextInput source="help" {...rest} />        
                    <TextInput source="solution" {...rest} />
                </>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'exercise' && (
                <>
                <TextInput multiline source="goals" {...rest} maxRows={8}/>
                <TextInput source="game_engine_guidance" label="Game Engine Guidance" {...rest} />
                </>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => formData.block_type === 'mcq' && (
                <>
                 {formData.block_type == "mcq" && formData.is_hide_board == false && <TextInput multiline source="goals" {...rest} maxRows={8}/>}
                <TextInput label="MCQ title" source="choice_title" {...rest} />
                <TextInput label="MCQ hint" source="choice_hint" {...rest} />
                   {/* Show a group of inputs - 'Text', 'Feedback', 'Correct' (true or false) for each input*/}
                    {[1,2,3].map((index) => (
                        <Box key={index} sx={{ display: 'flex', flexDirection: 'row', marginBottom: "1rem" }}>
                            <TextInput source={`choice_${index}_text`} label={`MCQ ${index}`} {...rest} sx={{p: "0.5rem"}}/>
                            <TextInput source={`choice_${index}_feedback`} label={`Feedback ${index}`} {...rest} sx={{p: "0.5rem"}}/>
                            <ChoiceCorrect rest={rest} index={index} data={formData}/>
                        </Box>))}
                </>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
          {({ formData, ...rest }) => formData.block_type === 'pgn' && (
            <TextInput source="pgn" multiline label="PGN" {...rest} rows={12}/>
            )}
        </FormDataConsumer>
        <FormDataConsumer>
            {({ formData, ...rest }) => ["pqa"].includes(formData.block_type) && (
                <>
                    <TextInput multiline minRows={3} source="question" label="Question?" {...rest} />
                    <TextInput multiline minRows={3} source="expected_answer" label="Expected Answer" {...rest} />
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: "100%" }}>
                        <NumberInput source="number_of_lines" label="Number of Lines" {...rest} />
                        <NumberInput source="number_of_words" label="Number of Words" {...rest} />
                    </Box>
                </>
            )}
        </FormDataConsumer>
    </SimpleForm>
);

const GenerateVoiceButton = (props: any) => {
    const record = useRecordContext(props);
    const notify = useNotify();
    const [loading, setLoading] = useState(false);
    const [update] = useUpdate();
    const [voiceStatus, setVoiceStatus] = useState<string | null>(VoiceStatus.INACTIVE);
    const defaultVoiceId = "19STyYD15bswVz51nqLf"; // set default to "Samara X"
    const [selectedVoice, setSelectedVoice] = React.useState(defaultVoiceId);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const dataset = {
        goals: record?.goals, 
        additionalVisuals: record?.additional_visuals, 
        animatedTutorial: record?.animated_tutorial,
        help: record?.help,
        title: record?.board_title,
    };

    const generatedMsgAndKeys = useMemo(() => {
        try {
            const parsed = JSON.parse(record?.sound_message_keys || "{}");
            return parsed;
        } catch (e) {
            console.error("Invalid JSON in sound_message_keys:", e);
            return {};
        }
    }, [record?.sound_message_keys]);

    const messageAndKeys = useMemo(() => {
        return extractMessageAndConstructKeyMap(dataset);
    }, [record]);

    const checkVoiceStatus = useCallback(() => {
        const generatedKeys = Object.keys(generatedMsgAndKeys);
        const messageKeys = Object.keys(messageAndKeys);
        let updateVoiceState = VoiceStatus.INACTIVE;

        if (generatedKeys.length === 0 || messageKeys.length === 0) {
            updateVoiceState = VoiceStatus.INACTIVE;
            return;
        }
        const unmatchedKeys = messageKeys.filter(
            (key) => !generatedKeys.includes(key.toLowerCase())
        );

        const isAllMatched = unmatchedKeys.length === 0 && messageKeys.length === generatedKeys.length;

        if (isAllMatched) {
            updateVoiceState = VoiceStatus.ACTIVE;
        } else {
            updateVoiceState = VoiceStatus.REQUIRED_UPDATE;
        }
        setVoiceStatus(updateVoiceState);
    }, [generatedMsgAndKeys, messageAndKeys]);

    useEffect(() => {
        checkVoiceStatus();
    }, [checkVoiceStatus]);

    useEffect(() => {
        if (!record) return;
        setSelectedVoice(record.voice_key || defaultVoiceId)
    }, [record])


    const handleVoiceOver = async () => {
        setLoading(true);
        try {
            if (!record) return;
            if (Object.values(dataset).every(value => !value)) {
                notify("Missing required content: Goals, Board Title, Visuals, Tutorial, or Help." , { type: "warning" });
                setLoading(false);
                return;
            }
            let messageAndKeys = extractMessageAndConstructKeyMap(dataset);
            const fileName = record?.name.trim().replace(/\s+/g, '-');
            // TODO: 
            // 1. REMOVE Duplicate Message before generate. using get the saved sound file and add it to 
            //    audiosprite options in voice-over api.
            //        
            // const savedSoundMessageKeys = JSON.parse(record.sound_message_keys);
            // if (savedSoundMessageKeys) {
            //     // compare and remove duplicate before send to server
            //     const newKeys = Object.keys(messageAndKeys).filter(key => !savedSoundMessageKeys[key]);
            //     const newMessages: any = {};
            //     for (const key of newKeys) {
            //         newMessages[key] = messageAndKeys[key];
            //     }
            //     messageAndKeys = newMessages;
            // }
            const voiceId = selectedVoice;
            const voiceResult = await generateVoiceOverMessages(messageAndKeys, voiceId);
            if (voiceResult?.status === 400) {
                // Handle Elevenlabs api quota exceeded operation send Email and notify
                if (voiceResult.error === "quota_exceeded") {
                    const { supportTeamEmail} = null //getEmailsBasedOnEnv()
                    sendEmail({
                        to: supportTeamEmail,
                        subject: "CCAI: Elevenlabs API Limit Reached",
                        message: voiceResult.message
                    })
                    notify("Limit Exceeded, Please try again later or contact the administrator.", { type: "error" })
                } else {
                    notify("Failed to Update Voiceover, Please try again later or contact the administrator.", { type: "error" })
                }
                setLoading(false)
                return;
            }
            // after generated voice lowercase the messageandkey to avoid duplication
            for (const key in messageAndKeys) {
                const newKey = key.toLowerCase();
                if (newKey !== key) {
                    messageAndKeys[newKey] = messageAndKeys[key];
                    delete messageAndKeys[key];
                }
            };
            
            if (voiceResult && voiceResult.audioBlob && voiceResult.sprites) {
                const audioFileBlob = voiceResult.audioBlob;
                const soundSprites = voiceResult.sprites;
                const lessonBlockId = record?.id;
                const audioBlobURL = URL.createObjectURL(audioFileBlob);
                const audioFile = new File(
                    [audioFileBlob], 
                    `${fileName}.mp3`, 
                    { type: "audio/mpeg", lastModified: new Date().getTime() }
                );
                update("lesson_blocks", { 
                    id: lessonBlockId, 
                    data: { 
                        ...record,
                        goals: record.goals,
                        sound_attachment_file_id: {
                            rawFile: audioFile,
                            src: audioBlobURL,
                            title: fileName
                        },
                        sound_sprites_json: soundSprites,
                        sound_message_keys: JSON.stringify(messageAndKeys),
                        voice_key: selectedVoice
                    },
                }, {
                    onSuccess: () => {
                        setLoading(false)
                        notify('Voice generated and updated successfully', { type: 'success' });
                    }
                })
            } else {
                setLoading(false)
                notify(`Failed to ${ voiceStatus === VoiceStatus.INACTIVE ? 'Add' : 'Update' } Voice Over, Please try again later.`, { type: 'error' });
                remoteLog("Failed to generate voice: Missing audio or sprite data", voiceResult);
            }
        } catch (error) {
            setLoading(false)
            notify('Error generating voice', { type: 'error' });
            remoteLog("Error generating voice for lesson block: ", error);
        }
    };

    const handleRemoveVoiceOver = async () => {
        setLoading(true);
        try {
            if (!record) return;
            update("lesson_blocks", {
                id: record.id,
                data: {
                    ...record,
                    sound_attachment_file_id: null,
                    sound_sprites_json: null,
                    sound_message_keys: null,
                    voice_key: null
                },
            }, {
                onSuccess: () => {
                    setLoading(false);
                    setVoiceStatus(VoiceStatus.INACTIVE)
                    notify('Voice over removed successfully', { type: 'success' });
                }
            });
        } catch (error) {
            setLoading(false);
            notify('Error removing voice over', { type: 'error' });
            remoteLog("Error removing voice over for lesson block: ", error);
        } finally {
            setShowConfirmDialog(false);
        }
    };

    const handleVoiceSelect = (event: any) => {
        const id = event.target.value;
        setSelectedVoice(id);
    };

    return (
        <>
            {loading && (
                <Box sx={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    bgcolor: (theme) => `${theme.palette.background.default}CC`,
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999
                }}>
                    <CircularProgress/>
                </Box>
            )}
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: "1rem",  width:"90%", justifyContent: 'flex-end'}}>
                <FormControl sx={{width: "15rem"}}>
                    <InputLabel sx={{fontSize: '0.9rem', fontWeight: '0.5rem'}}>Voice Character</InputLabel>
                    <Select sx={{'& .MuiFilledInput-input': {paddingTop: '0.75rem'}}} value={selectedVoice}
                            onChange={handleVoiceSelect} label="Voice Character" disabled={voiceStatus === VoiceStatus.ACTIVE}>
                        {voiceChoices.map((voice) => (
                            <MenuItem key={voice.id} value={voice.id}>
                                {voice.name} ({voice.type})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {(voiceStatus === VoiceStatus.REQUIRED_UPDATE || voiceStatus === VoiceStatus.INACTIVE) && (
                    <>
                        <Button
                            type='button'
                            startIcon={<GraphicEq/>}
                            label={`${voiceStatus === VoiceStatus.INACTIVE ? 'Add' : 'Update'} Voice Over`}
                            onClick={handleVoiceOver}
                            disabled={loading || voiceStatus === VoiceStatus.ACTIVE || !record}
                            loading={loading}
                        />
                    </>
                )}
                {voiceStatus !== VoiceStatus.INACTIVE && (
                    <Button
                        type='button'
                        label={'Remove Voice Over'}
                        loading={loading}
                        onClick={() => setShowConfirmDialog(true)}
                    />
                )}
                <Confirm
                    isOpen={showConfirmDialog}
                    title={"Remove Voice Over"}
                    content="Are you sure you want to remove the voice over?"
                    onConfirm={handleRemoveVoiceOver}
                    onClose={() => setShowConfirmDialog(false)}
                />
            </Box>
        </>
    );
    
}
