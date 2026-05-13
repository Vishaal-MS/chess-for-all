import Upload from "@mui/icons-material/Upload";
import {
    AutocompleteInput,
    DateInput,
    TextInput,
    Button,
    Create,
    SaveButton,
    SimpleForm,
    Toolbar,
    TopToolbar,
    useNotify,
    useRedirect,
    Loading,
    SelectInput, FormDataConsumer, BooleanInput,
    required, ReferenceInput,
    useChoicesContext,
    regex,
} from "react-admin";
import {
    closeDialog, createDefaults,
    dataProvider as swanDataProvider,
    getLocalStorage,
    openDialog,
    remoteLog,
    SimpleFileInput,
    useRealtimeComms
} from "@mahaswami/vc-frontend";
import { useCallback, useEffect, useRef, useState } from "react";
import {Dataset, ListAlt, PlayArrow, Send, SmartToyOutlined} from "@mui/icons-material";
import {Typography, Grid, Box, Tooltip, IconButton} from "@mui/material"
import {
    getDivisionId,
    getStudentId,
    getUserFullName,
    getUserId, isCoach,
    isStudent,
    sendEmail
} from "../../businessLogic";
import { getGameInvitationEmailTemplate, getGamePlayInvitationEmailTemplate } from "../../helpers/emailTemplates";
import {
    botChoices,
    colorChoices, DialogTitleByEntryMode,
    GAME_STATUS,
    GameEntryMethods,
    GameModes,
    GameResult,
} from "../../helpers/constants";
import { generateFileName } from "../../utils";
import {getGamePGN, extractDetailsFromPGNStr, handleGamePgnUpdate, readPGNFromFile, applyResult} from "./gameUtils.ts";
import {NotaBoardField} from "./NotaBoardField.tsx";
import { useFormContext } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { MultiCreateButton } from "./MultiCreateButton.tsx";
import { getStudentsByClassId } from "../../backend/students.ts";
import {validateGameCreation} from "./validateGameCreation.ts";
import {scanScoreSheet} from "../../backend/scoreSheetScan.ts";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { getTimeControlLabel, getTimeControlText } from "../time_controls/timeControlUtils.tsx";
import { updateGameById } from "../../backend/games.ts";
import {ClassesReferenceInput} from "../classes.tsx";

// TODO: Later need to consolidate the code.
const GameListActions = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const { classId, backUrl, enrollmentId } = location.state || {};
    const handleUploadPGN = async () => {
        openDialog(<UploadPGNDialog classId={classId}/>)
    }
    const handleCreatePGN = () => {
        openDialog(<CreatePGNDialog classId={classId} width={"80%"}/>);
    }
    const openPlayGameDialog = () => openDialog(<PlayGameDialog classId={classId}/>, { width: '50vw' })
    const openPlayBotGameDialog = () => openDialog(<PlayBotGameDialog classId={classId}/>)
    const openScanScoreCardDialog = () => openDialog(<ScanScoreCardDialog classId={classId}/>)

    const handleBackToClass = () => {
        navigate(backUrl);
    }

    const gameOptions = [
        { label: 'Upload Game', icon: <Upload />, onClick: handleUploadPGN },
        { label: 'Input Game Scoresheet', icon: <Dataset />, onClick: handleCreatePGN },
        { label: 'Scan Game Scoresheet', icon: <ListAlt />, onClick: openScanScoreCardDialog },
    ];
    if (isStudent()) {
        gameOptions.unshift({ label: 'Play With Bot', icon: <SmartToyOutlined />, onClick: openPlayBotGameDialog });
        gameOptions.unshift({ label: 'Play Game', icon: <PlayArrow />, onClick: openPlayGameDialog });
    } else {
        gameOptions.unshift({ label: 'Setup a Game', icon: <PlayArrow />, onClick: openPlayGameDialog });
    }

    return (
        <TopToolbar sx={{ alignItems: 'center', justifyContent: 'center'}}>
            {enrollmentId ? (
                <ActionButton
                    label="Return To Analytics"
                    icon={<KeyboardReturnIcon />}
                    onClick={() => navigate(backUrl)}
                />
            ) : (
                <>
                    {classId && (
                        <ActionButton
                            label="Return To Workspace"
                            icon={<KeyboardReturnIcon />}
                            onClick={handleBackToClass}
                        />
                    )}
                    <MultiCreateButton label="Add Game" options={gameOptions} />
                </>
            )}
        </TopToolbar>
    )
}

type CreatePGNDialogProps = {
    classId: number;
    uploadedPGN: string;
    gameEntryMode?: string;
};

const CreatePGNDialog = ({classId, uploadedPGN, gameEntryMode = GameEntryMethods.INPUT_SCORE_CARD}: CreatePGNDialogProps) => {
    const notify = useNotify();
    const [state, setState] = useState({loading: true, students:[], currentUserId: null}) ;
    const isPreviewPGN = uploadedPGN ? true : false;
    const dialogTitle = DialogTitleByEntryMode[gameEntryMode];
    const timeControlRef = useRef<any>(null);

    useEffect(() => {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const currentUserId = getUserId();

        const fetchStudents = async () => {
            try {
                const students = await getStudentsByClassId(dataProvider, classId);
                setState(prev => ({...prev, students: students, currentUserId}));
            } catch (error) {
                console.log("ERROR: While fetching the students", error);
                remoteLog("ERROR: While fetching the students", error);
            } finally {
                setState(prev => ({...prev, loading: false}));
            }
        };

        fetchStudents();

    }, []);

    const {loading, students, currentUserId} = state;

    if (loading) {
        return <Loading />
    }

    const handleOnSuccess = async (data: any) => {
        // update pgn file after created the game. to get game id for fileName
        const pgn = await getGamePGN();
        const fileName = generateFileName(pgn, data.id);
        const blob = await new Blob([pgn], {type: 'application/vnd.chess-pgn'});
        const file = await new File([blob], `${fileName}`, {type: 'application/vnd.chess-pgn'});
        const blobUrl = await URL.createObjectURL(blob)
        await updateGameById(data.id, {
            pgn_attachment_file_id: {
                rawFile: file,
                src: blobUrl,
                title: file.name
            },
        })
        closeDialog();
        notify("Game Saved Successfully!", {type: "success"})
    }
    const currentStudent = students?.find(student => student.user_id === currentUserId);

    const transformGameBeforeSave = async (data: any, students : any[]) => {
        let game = data;

        if (game.is_player1_external) {
            const player1Student = students.find(student => student.user.fullName === game.player1_name);
            game.player1_student_id = player1Student?.id || undefined;
        } else {
            const player1 = students.find(student => game?.player1_student_id === student.id);
            game.player1_name = player1?.user?.fullName;
        }

        if (game.is_player2_external) {
            const player2Student = students.find(student => student.user.fullName === game.player2_name);
            game.player2_student_id = player2Student?.id || undefined;
        } else {
            const player2 = students.find(student => game?.player2_student_id === student.id);
            game.player2_name = player2?.user?.fullName;
        }

        if (isStudent()) {
            const selectedPlayers = [game?.player1_student_id, game?.player2_student_id].filter(Boolean);
            if (!selectedPlayers.includes(getStudentId())) {
                notify("You (Student) must be one of the players", { type: "warning" });
                throw new Error("You must be one of the players");
            }
        }

        if (!game.event_date) {
            game = {...game, event_date: new Date()}
        }

        if (game?.time_control_id) {
            const timeControl = timeControlRef.current;
            handleGamePgnUpdate("time_control", timeControl?.base_time_number + "+" + timeControl?.increment_time_number);
        }

        // Update pgn
        const pgnHeaders = ["player1_name", "player2_name", "event", "event_date"];
        await pgnHeaders.map(header => {
            handleGamePgnUpdate(header, game?.[header]);
        });

        // Apply draw to update the pgn
        // TODO: Need to handle other results as well.
        if (game?.result && GameResult?.[game?.result].value === "draw") {
            applyResult("draw");
        }

        const pgn = await getGamePGN();

        if (game.is_player1_external && game.is_player2_external) {
            delete game['class_id'];
        }

        const tempFields = ["is_player1_external", "is_player2_external", "time_control"]; // Remove temp field from payload.
        tempFields.forEach(field => delete game[field]);

        return {
            ...game,
            pgn: pgn,
            is_feedback_requested: false
        };
    }

    let gameDefaultValues = {}

    if (isPreviewPGN) {
        const pgnDetails = extractDetailsFromPGNStr(uploadedPGN);
        if (pgnDetails) {
            const player1Student = students.find(student => student.user.fullName === pgnDetails.player1);
            const player2Student = students.find(student => student.user.fullName === pgnDetails.player2);
            const gameResult = GameResult.find(choice => choice.id == pgnDetails.result) ? pgnDetails.result : undefined;
            const timeControl = pgnDetails.timeControl;
            gameDefaultValues = {
                ...gameDefaultValues,
                event: pgnDetails.eventName || undefined,
                event_date: pgnDetails.eventDate ? new Date(pgnDetails.eventDate) : new Date(),
                player1_name: pgnDetails.player1 || undefined,
                player2_name: pgnDetails.player2 || undefined,
                status: GAME_STATUS.ENDED,
                method_of_entry: gameEntryMode,
                player1_student_id: player1Student?.id,
                player2_student_id: player2Student?.id,
                result: gameResult,
                is_feedback_requested: false,
                time_control: timeControl
            }
        }
    }

    const handleTimeControlChange = (id: number, value: any) => {
        timeControlRef.current = value;
    };

    return (
        <Create title={false} resource='games' mutationOptions={{onSuccess: handleOnSuccess}}
                transform={(data) => transformGameBeforeSave(data, students)}
        >
            <Typography sx={{mx: "1rem", mt: "0.5rem", mb: "-1rem"}} variant="h6">{dialogTitle}</Typography>
            <SimpleForm toolbar={false} defaultValues={{
                event_date: new Date,
                created_date: new Date,
                status: GAME_STATUS.ENDED,
                method_of_entry: GameEntryMethods.INPUT_SCORE_CARD,
                class_id: classId,
                division_id: getDivisionId(),
                user_id: currentUserId,
                ...gameDefaultValues
            }} validate={validateGameCreation}>
                <Grid container columnSpacing={1}>
                    <FormDataConsumer<{ is_player1_external: boolean }>>
                        {({formData, ...rest}) => {
                            const gameClassId = classId || formData.class_id;
                            const bothExternal = formData?.is_player1_external && formData?.is_player2_external;
                            const [optionStudents, setOptionStudents] = useState(students);

                            useEffect(() => {
                                const fetchClassStudents = async () => {
                                    if (gameClassId && isCoach()) {
                                        const dataProvider = window.swanAppFunctions.dataProvider;
                                        const classStudents = await getStudentsByClassId(dataProvider, gameClassId);
                                        setOptionStudents(classStudents);
                                    } else setOptionStudents(students);
                                };
                                fetchClassStudents();
                            }, [gameClassId]);

                            return (
                                <>
                                    <Grid item md={4} xs={8}>
                                        {formData.is_player1_external ? 
                                            <TextInput source={"player1_name"} label={"Player 1 (White)"} validate={required()}/>
                                        : <AutocompleteInput
                                            source="player1_student_id" validate={required()}
                                            choices={optionStudents.filter(student => student.id !== formData?.player2_student_id)}
                                            defaultValue={(!formData.is_player1_external && !isPreviewPGN) && currentStudent?.id}
                                            isPending={loading}
                                            resource="students" optionText="user.fullName" label="Player 1 (White)"/>}
                                    </Grid>
                                    <ExternalToggleButton 
                                        source="is_player1_external" 
                                        clearSource='player1_student_id'
                                        defaultValue={isPreviewPGN} />
                                    <Grid item md={4} xs={8}>
                                        {formData.is_player2_external ? 
                                            <TextInput source={"player2_name"} label={"Player 2 (Black)"} validate={required()}/>
                                        : <AutocompleteInput
                                            source="player2_student_id" validate={required()}
                                            choices={optionStudents.filter(student => student.id !== formData?.player1_student_id)}
                                            isPending={loading}
                                            resource="students" optionText="user.fullName" label="Player 2 (Black)"
                                        />}
                                    </Grid>
                                    <ExternalToggleButton 
                                        source="is_player2_external" 
                                        clearSource='player2_student_id'
                                        defaultValue={isStudent() || isPreviewPGN} />
                                    {isCoach() && !classId && !bothExternal &&
                                        <Grid item md={3} xs={12}>
                                            <ClassesReferenceInput source={"class_id"} />
                                        </Grid>
                                    }
                                    <Grid item md={(classId || bothExternal) ? 4 : 3} xs={12}>
                                        <TextInput source={"event"} label={"Event Name"}/>
                                    </Grid>
                                    <Grid item md={(classId || bothExternal) ? 3 : 2} xs={12}>
                                        <DateInput source={"event_date"} label={"Event Date"}/>
                                    </Grid>
                                    <Grid item md={(classId || bothExternal) ? 3 : 2.1} xs={12}>
                                        <ReferenceInput source="time_control_id" reference="time_controls" perPage={1000}
                                            queryOptions={{ meta: { scopingEscapeHatch: true } }} sort={{ field: 'name', order: 'ASC' }}>
                                            <TimeControlDropdown data={formData} onChange={handleTimeControlChange} />
                                        </ReferenceInput>
                                    </Grid>
                                    <Grid item md={1.9} xs={12}>
                                        <SelectInput source={"result"} label={"Result"} name={"result"} 
                                            choices={GameResult} validate={required()}/>
                                    </Grid>
                                </>
                            )
                        }}
                    </FormDataConsumer>
                    <SimpleFileInput sx={{display: "none"}} label="PGN File" source="pgn_attachment_file_id"/>
                </Grid>
                <NotaBoardField mode={GameModes.NEW} uploadedPGN={uploadedPGN}/>
                <SaveButton sx={{mt: '1rem'}} label="Save" alwaysEnable={isPreviewPGN}/>
            </SimpleForm>
        </Create>
    )
}

const TimeControlDropdown = ({ data, onChange }) => {
    const choiceContext = useChoicesContext();
    const timeControl = choiceContext?.allChoices?.find(timeControl => timeControl.base_time_number === data.time_control?.baseTime 
        && timeControl.increment_time_number === data.time_control?.increment);

    return (
        <AutocompleteInput 
            defaultValue={timeControl?.id}
            onChange={onChange} 
            validate={required()} 
            optionText={getTimeControlLabel} 
            inputText={getTimeControlText} />
    );
}

const ExternalToggleButton = ({ source, clearSource, defaultValue }) => {
    const { setValue } = useFormContext();

    return (
        <Grid item md={2} xs={4} sx={{display: 'flex', alignItems: 'center'}}>
            <BooleanInput
                label="External?"
                source={source}
                defaultValue={defaultValue}
                sx={{ ml: '1rem' }}
                onChange={(event) => {
                    const checked = event.target.checked;
                    if (checked) {
                        setValue(clearSource, null, { shouldValidate: true, shouldDirty: true });
                    }
                }}
            />
        </Grid>
    );
};

interface ActionButtonProps {
    label: string;
    onClick(): void;
    icon: any
}

const ActionButton = ({ label, onClick, icon }: ActionButtonProps) => {
    return (
        <Button label={label} onClick={onClick}>{icon}</Button>
    )
}

const UploadPGNDialog = ({classId}: { classId: number }) => {
    const PreviewToolbar = () => {
        const {watch} = useFormContext();
        const fileInput = watch("pgn_attachment_file_id");
        const pgnFile = fileInput?.rawFile;
        const handlePreviewAndSave = useCallback(async (event) => {
            event.preventDefault();
            if (pgnFile) {
                const pgnContent = await readPGNFromFile(pgnFile);
                closeDialog();
                openDialog(
                    <CreatePGNDialog
                        classId={classId}
                        width={"80%"}
                        uploadedPGN={pgnContent}
                        gameEntryMode={GameEntryMethods.FILE_UPLOAD}/>
                );
            }
        }, [pgnFile]);

        return (
            <Toolbar>
                <SaveButton type="button" label="Proceed" onClick={handlePreviewAndSave} variant="text"/>
            </Toolbar>
        )
    }

    return (
        <SimpleForm toolbar={<PreviewToolbar/>}>
            <Typography variant="h6" sx={{mb: 2}}>Upload A Game File</Typography>
            <SimpleFileInput
                source="pgn_attachment_file_id"
                id="simple-file-upload-input"
                label="Choose a PGN File To Upload"
                inputProps={{accept: ".pgn"}}
                fullWidth
            />
        </SimpleForm>
    )
}

const PlayGameDialog = ({ classId, props }: { classId: number, props: any }) => {
    const notify = useNotify();
    const redirect = useRedirect();
    const realtimeComms = useRealtimeComms();
    const [state, setState] = useState<any>({
        loading: true,
        students: [],
        enrollments: [],
    })

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const dataProvider = window.swanAppFunctions.dataProvider;
                const tenantId = JSON.parse(getLocalStorage("user")).tenant_id;
                const { data: students } = await dataProvider.getList("students", {
                    meta: { prefetch: ["users"] },
                    pagination :  { page: 1, perPage: 10000 }
                })
                const { data: enrollments } = await swanDataProvider.getList('enrollments', {
                    filter: { tenant_id: tenantId },
                    meta: { prefetch: ['students'] },
                    pagination :  { page: 1, perPage: 10000 }
                })
                setState({ students, enrollments, loading: false });
            } catch (error) {
                console.error(error)
            }
        }
        fetchStudents();
    }, [])

    const BottomToolbar = ({ isLoading }: { isLoading: boolean }) => (
        <Toolbar>
            <SaveButton label="Invite" icon={<Send/>} loading={isLoading}/>
        </Toolbar>
    )
    const { students, enrollments } = state;

    const addPlayerNames = (data: any) => {
        const player1 = students.find(student => student.id === data.player1_student_id);
        const player2 = students.find(student => student.id === data.player2_student_id);
        return {
            ...data,
            event: "Friendly Game",
            event_date: new Date(),
            status: GAME_STATUS.INVITED,
            method_of_entry: GameEntryMethods.PLAY_GAME,
            player1_name: player1?.user.fullName,
            player2_name: player2?.user.fullName,
            class_id: data.class_id && !classId ? data.class_id  : classId,
            user_id: getUserId(),
            starting_board: data.starting_board,
            division_id: getDivisionId(),
            is_feedback_requested: false
        }
    }

    const sendInvitation = async (data: any) => {
        try {
            const dataProvider = window.swanAppFunctions.dataProvider;
            setState({...state, loading: true})
            const { player1_student_id, player2_student_id, class_id, time_control_id } = data;
            let className = "", timeControlName = "";
            if (class_id) {
                const {data: classData} = await dataProvider.getOne("classes", {id: class_id});
                className = classData?.name;
            }
            if (time_control_id) {
                const {data: timeControl} = await dataProvider.getOne("time_controls", {id: time_control_id});
                timeControlName = getTimeControlText(timeControl);
            }
            const player1 = students.find(student => student.id === player1_student_id);
            const player2 = students.find(student => student.id === player2_student_id);
            const inviteURL = `/#/games/${data.id}/play`;
            if (isStudent()) {
                const invitationTemplate = getGameInvitationEmailTemplate(player1, player2, inviteURL, className, timeControlName);
                await sendEmail({
                    to: player2.user.email,
                    ...invitationTemplate
                })
                notify(`Invitation Sent Successfully to ${player2.user.fullName}`, { type: "success" })
                realtimeComms.publish("game/notifications", { action: "invitation", challenger: player1, challengee: player2, game: data })
            } else {
                const coachName = getUserFullName();
                const player1PlayInvitationTemplate = getGamePlayInvitationEmailTemplate(coachName, player1, player2, inviteURL, className, timeControlName);
                const player2PlayInvitationTemplate = getGamePlayInvitationEmailTemplate(coachName, player2, player1, inviteURL, className, timeControlName);
                await Promise.all([
                    sendEmail({
                        to: player1.user.email,
                        ...player1PlayInvitationTemplate
                    }),
                    sendEmail({
                        to: player2.user.email,
                        ...player2PlayInvitationTemplate
                    })
                ]);
                notify(`Invitation Sent Successfully to ${player1.user.fullName} and ${player2.user.fullName}`, { type: "success" })
                realtimeComms.publish("game/notifications", { action: "invitation_from_coach", challenger: player1, challengee: player2, game: data })
            }
            setState({...state, loading: false})
            closeDialog();
            redirect(`/games/${data.id}/play`)
        } catch (error) {
            console.error(`Failed to send invitation: ${error}`)
        }
    }

    const currentUserId = getUserId();
    const currentStudent = students?.find(student => student.user_id === currentUserId);
    const validateGameOverFEN = (fen: string) => {
        if (!fen) return undefined;
        const gameClone = new Game(new Position(fen));
        const result = GameKernel.staticCheckTechnicalResult(gameClone); // Check for result
        const isLegal = gameClone.getCurPos().isLegal()
        if (!isLegal) {
            return "Invalid position.";
        }
        if (result !== 3) {
            return "This FEN represents a completed game (checkmate, stalemate, or draw).";
        }
        return undefined;
    }
    const emptyFENValidator = [regex(
        /([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[wb]\s(-|[KQkqa-h]{1,4})\s(-|[a-h][1-8])\s\d+\s\d+/,
        "Invalid FEN"
    ), validateGameOverFEN]

    return (
        <Create {...createDefaults(props)} title={false} resource="games" transform={addPlayerNames} mutationOptions={{ onSuccess: sendInvitation }}>
            <SimpleForm defaultValues={{ created_date: new Date(), status: GAME_STATUS.INVITED }} toolbar={<BottomToolbar isLoading={state.loading}/>}>
                <Typography variant="h6">{isStudent() ? "Play a Game" : "Setup a Game"}</Typography>
                {isCoach() && !classId &&
                    <ClassesReferenceInput source="class_id">
                        <AutocompleteInput validate={required()} source={"name"} />
                    </ClassesReferenceInput>
                }
                <FormDataConsumer>
                    {({ formData }) => {
                        const setUpClassId = classId || formData.class_id;
                        const classEnrollments = enrollments.filter((enrollment) => enrollment.class_id === setUpClassId);
                        const studentIds = classEnrollments.map((enrollment) => enrollment.student_id);
                        const classStudents = students.filter((student) => studentIds.includes(student.id));
                        const player1Students = classStudents.filter((student) => student.id !== formData.player2_student_id);
                        const player2Students = classStudents.filter((student) => student.id !== formData.player1_student_id);

                        return (
                            <Box sx={{display: "flex", width: "100%", gap: "0.75rem"}}>
                                <AutocompleteInput 
                                    label={"Player 1 (White)"}
                                    defaultValue={currentStudent?.id}
                                    source="player1_student_id"
                                    choices={player1Students}
                                    optionText={'user.fullName'}
                                    hidden={isStudent()}
                                    validate={required()}
                                    readOnly={isCoach() && !classId && !formData.class_id}/>
                                <AutocompleteInput 
                                    label={isStudent() ? "Opponent" : "Player 2 (black)"}
                                    choices={player2Students}
                                    source="player2_student_id"
                                    optionText="user.fullName"
                                    validate={required()}
                                    isPending={state.loading}
                                    readOnly={isCoach() && !classId && !formData.class_id} />
                            </Box>
                        )
                    }}
                </FormDataConsumer>
                <ReferenceInput source="time_control_id" reference="time_controls" perPage={1000}
                    queryOptions={{ meta: { scopingEscapeHatch: true } }} sort={{ field: 'name', order: 'ASC' }}>
                    <AutocompleteInput validate={required()} optionText={getTimeControlLabel} inputText={getTimeControlText} />
                </ReferenceInput>
                {isCoach() &&
                    <TextInput source={"starting_board"} label="Starting Position (FEN)" validate={emptyFENValidator}/>
                }
            </SimpleForm>
        </Create>
    )
}

const PlayBotGameDialog = ({ classId }: { classId: number }) => {
    const redirect = useRedirect();
    const BottomToolbar = () => (
        <Toolbar>
            <SaveButton label="Play" icon={<PlayArrow/>} alwaysEnable/>
        </Toolbar>
    );

    const playWithBot = async (data: any) => {
        closeDialog();
        const gameUrl = `/games/${data.id}/play/bot`;
        if (isStudent()) {
            redirect(gameUrl);
        }
    };

    const transformBeforeSave = async (data: any) => {
        const botDifficulty = data.bot_difficulty as string;
        const isPlayerWhite =  data.chosen_color === "white"
        let studentId = isStudent() ? getStudentId() : undefined;
        return {
            event: "Play With Bot",
            method_of_entry: GameEntryMethods.BOT_GAME,
            user_id: getUserId(),
            division_id: getDivisionId(),
            event_date: new Date(),
            status: GAME_STATUS.IN_PROGRESS,
            player1_student_id: isPlayerWhite ? studentId : undefined,
            player2_student_id: !isPlayerWhite ? studentId : undefined,
            player1_name: isPlayerWhite ? getUserFullName() : "Bot",
            player2_name: !isPlayerWhite ?  getUserFullName() : "Bot",
            bot_difficulty: botDifficulty,
            class_id: classId,
            created_date: new Date(),
            is_feedback_requested: false,
            time_control_id: data.time_control_id
        }
    }

    return (
        <Create title={false} resource="games" transform={transformBeforeSave} mutationOptions={{ onSuccess: playWithBot }}>
            <SimpleForm 
                defaultValues={{ bot_difficulty: "easy"}}
                toolbar={<BottomToolbar/>}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>Play With Bot</Typography>
                <SelectInput choices={botChoices} source="bot_difficulty" label="Bot Difficulty" validate={required()}/>
                <SelectInput choices={colorChoices} source="chosen_color" label="Play As" validate={required()}/>
                <ReferenceInput source="time_control_id" reference="time_controls" perPage={1000}
                    queryOptions={{ meta: { scopingEscapeHatch: true } }} sort={{ field: 'name', order: 'ASC' }}>
                    <AutocompleteInput validate={required()} optionText={getTimeControlLabel} inputText={getTimeControlText} /> 
                </ReferenceInput>
            </SimpleForm>
        </Create>
    )
}

const ScanScoreCardDialog = ({ classId }: { classId: number }) => {
    const [loading, setLoading] = useState(false);
    const notify = useNotify();

    const PreviewToolbar = () => {
        const { getValues } = useFormContext();
        const pgnFile = getValues("score_card_attachment_file_id")?.rawFile;

        const handlePreviewAndSave = useCallback(async (event) => {
            event.preventDefault();
            if (!pgnFile) return;

            setLoading(true);
            try {
                const scorecardBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        const base64 = result.split(',')[1];
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(pgnFile);
                });
                // Call scan score sheet
                const data =  await scanScoreSheet(scorecardBase64);
                if (data?.pgn) {
                    closeDialog();
                    openDialog(
                        <CreatePGNDialog
                            width="80%"
                            uploadedPGN={data.pgn}
                            classId={classId}
                            gameEntryMode={GameEntryMethods.SCAN_SCORE_CARD}
                        />
                    );
                } else {
                    notify("Failed to scan scorecard, Try again", {type: "warning"});
                }
            } catch (err) {
                remoteLog('Failed to convert scorecard.', err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, [pgnFile]);

        return (
            <Toolbar>
                <SaveButton
                    label="Proceed"
                    onClick={handlePreviewAndSave}
                    variant="text"
                    disabled={loading}
                    loading={loading}
                />
            </Toolbar>
        )
    }

    return (
        <SimpleForm toolbar={<PreviewToolbar/>}>
            <Typography variant="h6" sx={{mb: 2}}>Upload A Scoresheet</Typography>
            <SimpleFileInput
                source="score_card_attachment_file_id"
                id="simple-file-upload-input"
                label="Choose a Scoresheet File To Upload"
                fullWidth
            />
            <ScoreCardPreview source="score_card_attachment_file_id"/>
        </SimpleForm>
    )
}

const SHowImage = ({source}) => (
    <Box sx={{display: "flex", justifyContent: "center"}}>
        <img
            src={source}
            alt="Preview"
            style={{
                height: "80vh",
                width: "100%",
                objectFit: "contain",
            }}
        />
    </Box>
)

const ScoreCardPreview  = ({ source }: { source: string }) => {
    const { watch } = useFormContext();
    const imageFileId = watch(source);
    if (!imageFileId) return null;
    return (
        <Box sx={{ position: "relative", display: "inline-block", mt: "1rem" }}>
            <img
                src={imageFileId?.src}
                style={{ height: "10rem", width: "15rem", objectFit: "cover" }}
                alt="Scoresheet Preview"
            />
            <Tooltip title={"Preview"}>
                <IconButton
                    onClick={() => openDialog(<SHowImage width={"70%"} source={imageFileId?.src}/>)}
                    sx={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "grey.200"
                    }}
                 >
                    <FullscreenIcon  fontSize="small" sx={{color: '#277ED5'}}/>
                </IconButton>
            </Tooltip>
        </Box>
    )
}

export default GameListActions;
