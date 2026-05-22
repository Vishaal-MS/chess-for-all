import { useEffect, useRef, useState } from "react";
import {Button, DateField, Loading, useRecordContext} from "react-admin";
import { CBDiagram } from "../../fields/ai_lesson/CBDiagram";
import { clearChessBoards, loadChessBoards } from "../../fields/ai_lesson/ai_lesson_utils";
import { Box, Card, CardHeader, Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { NotaTable } from "./NotaTable.tsx";
import {
    getGamePGN,
    extractDetailsFromPGNStr,
    initializeBotGameBoardAndBot, flipGameBoard,
    updateGameHeader, applyResult,
} from "./gameUtils.ts";
import { createPGNFileAndUpdateGame, updateGameById } from "../../backend/games.ts";
import { getStudentId, getUserId } from "../../backend/common_logics.ts";
import {GAME_STATUS, GameModes, BotDifficulty, GAME_ACTIONS, GameEndResult, GAME_RESULTS, GameEntryMethods} from "../../helpers/constants.ts";
import { GameEventType, GameResourceType, Player } from "./types.ts";
import { displayTimeWithMillisecond, formatMillisecondsToTime, formatTime } from "../../utils.ts";
import { BOT_ACTIONS } from "./PlayWithBotView.tsx";
import { EmojiEvents, FileDownload, KeyboardReturn, PlayArrow, Visibility } from "@mui/icons-material";
import { getLocalStorage } from "@mahaswami/vc-frontend";
import { useLocation, useNavigate } from "react-router-dom";


interface NotaBoardFieldProps {
    uploadedPGN?: string;
    realtimeComms?: any;
    mode?: typeof GameModes[keyof typeof GameModes];
    sendEvent?: (event: GameEventType) => Promise<void>;
    botGameEvent?: any;
    players?: Player[];
    currentPlayer?: string;
}

type DateStateType = {
    loading: boolean;
    pgn: string;
    pgnDetails: any;
    starting_board?: string | null;
}

const FEN_STARTING_BOARD = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const handleBotGame = (setData: any, record: any, dataURL: string, botGameEvent: any, playersRef: any) => {
    const updateGame = async (id, trackDetails) => {
        const currentTime = new Date();
        // Game OVER Logic
        const kernal = window.glApp.panelMgr.modules[0].getKernel();
        const side = kernal.game.getCurPos().sd; // current move side (white 0 or black 1)
        const playerIndex = side === 0 ? 1 : 0;
        const elapsedTime = playersRef.current?.[playerIndex]?.elapsedTime;
        kernal.game.getOrCreateCurrAnno().addPostText(`[%emt ${formatMillisecondsToTime(elapsedTime)}]`);
        const pgn = trackDetails.pgn;
        const gameResult = trackDetails.result.toString();
        setData(prev => ({ ...prev, pgn: pgn }));
        if (trackDetails.isMate || trackDetails.isStaleMate) {
            let endResult = {reason: "Checkmate", result: GameEndResult.LOSE};
            let gamePayload = {
                status: GAME_STATUS.ENDED,
                pgn: pgn,
                result: gameResult,
                player1_time_number: playersRef.current?.[0]?.remainingTime,
                player2_time_number: playersRef.current?.[1]?.remainingTime,
                last_move_time: currentTime,
            };

            if (trackDetails.isMate) { // Checkmate
                const isWhiteWon = kernal.game.getCurPos().isBTM();
                const playerIsWhite = !!record?.player1_student_id;
                if (isWhiteWon) {
                    endResult = { ...endResult, result: playerIsWhite ? GameEndResult.WON : GameEndResult.LOSE };
                } else {
                    endResult = { ...endResult, result: playerIsWhite ? GameEndResult.LOSE : GameEndResult.WON };
                }
            } else if (trackDetails.isStaleMate) { // Stalemate
                endResult = { reason: "StaleMate", result: GameEndResult.DRAW };
            } else if (gameResult === GAME_RESULTS.DRAW) {
                endResult = { reason: "Draw", result: GameEndResult.DRAW };
            }

            await createPGNFileAndUpdateGame(record.id, pgn, gamePayload);
            await botGameEvent(BOT_ACTIONS.GAME_OVER, endResult);
        } else {
            await botGameEvent(BOT_ACTIONS.SWITCH_TURN, { currentTime: currentTime, activePlayer: side === 0 ? "white" : "black" });
            await updateGameById(record?.id, {
                pgn: pgn,
                player1_time_number: playersRef.current?.[0]?.remainingTime,
                player2_time_number: playersRef.current?.[1]?.remainingTime,
                last_move_time: currentTime
            });
        }
    }
    loadChessBoards(updateGame);
    if (record?.status !== GAME_STATUS.IN_PROGRESS) {
        window.glApp.panelMgr.modules[0].getKernel().boardWin.allowInput = false;
    }
    if (!record.pgn && !dataURL) {
        initializeBotGameBoardAndBot(record);
    } else {
        if (record?.player2_student_id) {
            flipGameBoard();
        }
    }
};

// TODO Later seperate the logic in seperate component
export const NotaBoardField = ({ uploadedPGN, realtimeComms, mode = GameModes.EDIT, sendEvent, botGameEvent, players, currentPlayer }: NotaBoardFieldProps) => {

    const record = useRecordContext<GameResourceType>();
    const dataURL = record?.pgn_attachment_file_id?.[0].src;
    const isNew = mode === GameModes.NEW;
    const isBot = mode === GameModes.BOT;
    const isShow = mode === GameModes.SHOW;

    const isXLargeScreen = useMediaQuery(theme => theme.breakpoints.up('xl'));

    let maxSize = isNew ? "80%/max=380" : "100%/max=542";
    
    if (isXLargeScreen) {
        maxSize = "80%/max=700"
    }

    const [data, setData] = useState<DateStateType>({
        loading: true,
        pgn: uploadedPGN || "",
        pgnDetails: {},
        starting_board: null
    })
    const navigate = useNavigate();

    useEffect(() => {
        const getPGNFromPGNGameFile = async () => {
            if (dataURL) {
                const response = await fetch(dataURL);
                const text = await response.text();
                let pgnDetails = extractDetailsFromPGNStr(text);
                setData({
                    loading: false,
                    pgn: text,
                    pgnDetails: pgnDetails || {}
                })
            }
        }
        // NOTE: If pgn is not in the game, fetch from the file.
        if (!record?.pgn && dataURL) {
            getPGNFromPGNGameFile();
        } else {
            setData({
                loading: false,
                pgn: record?.pgn || "",
                pgnDetails: {},
                starting_board: record?.pgn ? null : record?.starting_board
            })
        }
    }, [record])

    // This is to get the update players 
    // because adding players as dependency array in the below useEffect will lead to race condition.
    const playersRef = useRef(players);
    useEffect(() => {
        // whenever the players changes update the player ref.
        playersRef.current = players;
    }, [players]);

    useEffect(() => {
        setTimeout(() => {
            const updatePgnCallback = () => {
                if (mode === GameModes.SHOW) return;
                // TODO: Result not updating in pgn without deffer.
                setTimeout( () => {
                    const pgn = getGamePGN();
                    setData(prev => ({ ...prev, pgn }));
                },0);
            };
            // The board move navigation buttons showing in top fix 
            var elements = document.getElementsByClassName("belowDiag");
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
            // Disable auto eval possible moves when long press the piece
            window.glApp.config.useAnalysisEngines = false;
            if (mode == GameModes.PLAY) {
                if (realtimeComms && record) {
                    const updateGame = async (id, trackDetails) => {
                        const kernal = window.glApp.panelMgr.modules[0].getKernel();
                        const gameResult = trackDetails.result.toString();
                        updatePgnCallback();
                        const side = kernal.game.getCurPos().sd; // current move side (white 0 or black 1)
                        const whiteTime = playersRef.current?.[0]?.consumedTime;
                        const blackTime = playersRef.current?.[1]?.consumedTime;
                        kernal.game.getOrCreateCurrAnno().addPostText(`[%emt ${side === 0 ? formatMillisecondsToTime(blackTime) : formatMillisecondsToTime(whiteTime)}]`);
                        const pgnWithTime = getGamePGN();
                        window.glApp.panelMgr.modules[0].getKernel().game.assign(kernal.game);
                        realtimeComms.publish(`games/${record?.id}`, {
                            action: "update",
                            block: { pgn: pgnWithTime, playedBy: getUserId() }
                        })

                        // Game OVER Logic
                        switch (gameResult) {
                            case GAME_RESULTS.WHITE_WINS:
                            case GAME_RESULTS.BLACK_WINS:
                                await sendEvent?.({
                                    action: GAME_ACTIONS.GAME_OVER,
                                    payload: {
                                        result: gameResult,
                                        pgn: pgnWithTime,
                                        players: playersRef.current,
                                        reason: "Checkmate",
                                        wonBy: getStudentId()
                                    },
                                })
                                break;
                            case GAME_RESULTS.DRAW:
                                await sendEvent?.({
                                    action: GAME_ACTIONS.GAME_OVER,
                                    payload: {
                                        result: gameResult,
                                        pgn: pgnWithTime,
                                        players: playersRef.current,
                                        reason: "Draw",
                                        isDraw: true
                                    },
                                })
                                break;
                            case GAME_RESULTS.UNFINISHED:
                                await sendEvent?.({
                                    action: GAME_ACTIONS.MOVE,
                                    payload: {
                                        pgn: pgnWithTime,
                                        players: playersRef.current,
                                    },
                                });
                                break;
                            default:
                                break;
                        }
                    }

                    const retrieveGame = async (id, block) => {
                        const currentUserId = getUserId();
                        const isIAmOneOfThePlayer = record.player1_student?.user_id === currentUserId || record.player2_student?.user_id === currentUserId;
                        if (block && block.lesson_block_id == id) {
                            // Simply toggle the Side.
                            const isMyTurn = block.playedBy !== currentUserId;
                            setData(prev => ({ ...prev, pgn: block.pgn }));
                            return { ...block, allowInput: isIAmOneOfThePlayer && isMyTurn, isMyTurn };
                        }
                        // based on the game side and player play as color we decide who should move
                        const game = window.glApp.panelMgr.modules[0].getKernel().game;
                        let canPlay = false;
                        if (isIAmOneOfThePlayer) {
                            const side =  game.getCurPos().sd // current move side (white 0 or black 1)
                            canPlay = (record.player1_student?.user_id === currentUserId && side === 0) ||
                                (record.player2_student?.user_id === currentUserId && side === 1);
                        }
                        return { allowInput: canPlay }
                    }
                    const realtimeOptions = {
                        topic: `games/${record?.id}`,
                        tracker: realtimeComms
                    }
                    loadChessBoards(updateGame, retrieveGame, realtimeOptions);
                    if (record.status === GAME_STATUS.ENDED) {
                        window.glApp.panelMgr.modules[0].getKernel().boardWin.allowInput = false
                    }
                    if (record.player2_student?.user_id === getUserId()) {
                        window.glApp.panelMgr.fnFlipBoard(0)
                    }
                    // Fill the pgn with game details (white, black, date etc,..)
                    updateGameHeader(record);
                }
            } else if (mode == GameModes.SHOW) {
                loadChessBoards(updatePgnCallback);
                if (window.glApp.panelMgr.modules?.[0]?.getKernel()) {
                    window.glApp.panelMgr.modules[0].getKernel().boardWin.allowInput = false
                }
            } else if (isBot) {
                handleBotGame(setData, record, dataURL, botGameEvent, playersRef);
            } else {
                loadChessBoards(updatePgnCallback);
            }
        }, 1000)
        return () => {
            clearChessBoards();
        }
    }, [record]);


    if (data.loading) {
        return <Loading/>
    }
    let boardRecord: Record<string, any> = {};

    if(record?.id) {
        boardRecord = {
            block_type: "nota",
            moves: data.pgn,
            starting_board: data.starting_board
        }
        if (isBot)  {
            const botDifficulty = record?.bot_difficulty || "easy";
            boardRecord.bot_difficulty = BotDifficulty[botDifficulty];
        }
        if (isShow) {
            boardRecord.hideButtons = false;
        } else {
            boardRecord.hideButtons = true;
        }

    } else {
        boardRecord = {
            block_type: "nota",
            starting_board: FEN_STARTING_BOARD,
            board_title: "Enter Position",
            hideButtons: true
        }
    }

    if (uploadedPGN) {
        boardRecord.moves = uploadedPGN
        boardRecord.starting_board = ""
    }

    const handleWithDrawWithBot = async () => {
        const playerIsWhite = !!record?.player1_student_id;
        const result = playerIsWhite ? "black_wins" : "white_wins";
        applyResult(result);
        const pgn = getGamePGN();
        const payload = {
            status: GAME_STATUS.ENDED,
            result: playerIsWhite ? "0" : "2",
            pgn: pgn,
            player1_time_number: playersRef.current?.[0]?.remainingTime,
            player2_time_number: playersRef.current?.[1]?.remainingTime,
        }

        await createPGNFileAndUpdateGame(record?.id, pgn, payload);
        await botGameEvent?.(BOT_ACTIONS.NAVIGATE_BACK);
    }

    const storeGamePGN = async (pgn: string) => {
        await createPGNFileAndUpdateGame(record?.id, pgn, {pgn : pgn});
    }

    const handleNavigate = () => {
        const classGameState = getLocalStorage("class_game_state");
        if (classGameState) {
            const {classId, backUrl, enrollmentId, student_id} = JSON.parse(classGameState);
            navigate('/games', {state: {
                    classId: classId,
                    enrollmentId: enrollmentId,
                    student_id: student_id,
                    className: record?.class?.name,
                    backUrl: backUrl
                }})
        } else {
            navigate('/games', {state: {className: record?.class?.name}})
        }

    }

    const gamePlayers = players ? players :
        [{ remainingTime: record?.player1_time_number }, { remainingTime: record?.player2_time_number }]

    return (
        <Grid container direction={{xs: "row-reverse" }}>
            <Grid item md={6} sm={12} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                height: theme => theme.breakpoints.down("md") ? '100%' : isNew ? 'calc(80vh - 7rem)' : 'calc(100vh - 8rem)', gap: "0.3rem"}}>   
                {!isNew && <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", ml: "-1.15rem"}}>
                    <PlayerCard name={record?.player1_name} isShow={isShow} winner={record?.result == GAME_RESULTS.WHITE_WINS}
                        isMyTurn={isBot ? currentPlayer === "white" :  players?.[0].id == currentPlayer} 
                        rating={83} time={gamePlayers?.[0].remainingTime} avatar="" />
                    <PlayerCard name={record?.player2_name} isShow={isShow} winner={record?.result == GAME_RESULTS.BLACK_WINS}
                        isMyTurn={isBot ? currentPlayer === "black" : players?.[1].id == currentPlayer} 
                        rating={813} time={gamePlayers?.[1].remainingTime} avatar=""/>
                </Box>}
                <CBDiagram record={boardRecord} maxSize={maxSize} />
            </Grid>
            <Grid item sm={12} md={6} mb={'1rem'}>            
                <Card>
                    {!isNew && 
                        <CardHeader 
                            sx={cardHeaderSx} 
                            title={
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: "center", gap: '0.5rem', mr: !isShow && "20%"}}>
                                    <Typography fontWeight={"bold"}>{record?.event}</Typography>
                                    <Typography variant="body2">
                                        (<DateField source="event_date"/>)
                                    </Typography>
                                </Box>
                            }
                            avatar={
                                <Button
                                    style={{color: 'white'}}
                                    title={isShow ? "Return to Games" : "Back"}
                                    onClick={isShow ? handleNavigate : () => navigate(-1)}
                                    startIcon={<KeyboardReturn sx={{ fontSize: "1.5rem !important"}}/>}
                                />
                            }
                            action={isShow && <ShowActions/>}
                        />
                    }
                    <NotaTable pgn={data.pgn || uploadedPGN} mode={mode} players={{ player1: record?.player1_student, player2: record?.player2_student}}
                               actions={{onWithdraw: handleWithDrawWithBot, onAddComment: storeGamePGN }}/>

                </Card>
            </Grid>
        </Grid>
    )
}

const cardHeaderSx: React.CSSProperties | ((theme: any) => React.CSSProperties) = (theme) => ({
    p: 0,
    justifyContent: 'center',
    display: 'flex',
    textAlign: 'center',
    background: `linear-gradient(45deg, 
      ${theme.palette.secondary.dark} 0%, 
      ${theme.palette.secondary.light} 50%, 
      ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    minHeight: 40,
    borderTopLeftRadius: "0.3rem",
    borderTopRightRadius: "0.3rem",
});

const getPlayUrl = (id?: number, canStillPlay?: boolean, isPlayWithBot?: boolean) => {
    if (!canStillPlay) return "";
    return isPlayWithBot ? `/games/${id}/play/bot` : `/games/${id}/play`;
};

const ShowActions = () => {
    const record = useRecordContext();
    const { state: locationState } = useLocation();
    const navigate = useNavigate();
    const isPlayWithBot = record?.method_of_entry === GameEntryMethods.BOT_GAME;

    const currentStudentId = getStudentId();
    const canStillPlay = record?.status === GAME_STATUS.IN_PROGRESS;
    const isPlayer = record?.player1_student_id === currentStudentId || record?.player2_student_id === currentStudentId;
    const playUrl = getPlayUrl(record?.id as number, canStillPlay, isPlayWithBot);
    const endedGame = locationState?.status == GAME_STATUS.WITHDRAWN;
    const pgnFileUrl = record?.pgn_attachment_file_id?.[0]?.src;
    const buttonProps = {sx: {fontSize : "1.5rem !important"}}
    
    return (
        <Stack direction={"row"} spacing={-3} sx={{marginTop: '0.5rem'}}>
            {record && canStillPlay && !endedGame && (
                <Button
                    onClick={() => navigate(playUrl)}
                    sx={{ color: "white"}}
                    title={isPlayer ? "Play" : "Watch Live"}
                    startIcon={isPlayer ? <PlayArrow {...buttonProps}/> : <Visibility {...buttonProps}/>}
                />
            )}
            <Button
                href={pgnFileUrl}
                sx={{ color: "white"}}
                disabled={!pgnFileUrl}
                title="Download As PGN"
                download={record?.pgn_attachment_file_name}
            >
                <FileDownload {...buttonProps}/>
            </Button>
            {/*<EditButton/> TODO: Edit Function not done yet*/}
        </Stack>
    );
}

const PlayerCard = ({ name, isMyTurn, time, isShow, winner }: any) => {
    const isPlaying = isMyTurn && !isShow;
    const nameColor = isPlaying ? "black" : "";
    const theme = useTheme();
    const lastSeconds = time < 20000;// last 20 seconds
    const backgroundColor = (theme) => !isShow && isMyTurn ? theme.palette.secondary.light : 'transparent';

    return (
        <Card sx={{ 
            p: '0.2rem 0.5rem', 
            width: "15rem",
            [theme.breakpoints.up("xl")]: {
                width: "18.5rem"
            },
            display: 'flex', alignItems: 'center', backgroundColor,
        }}>
            <Typography variant="subtitle2" color={nameColor} sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, width: "100%" }}>
                {name}{winner && <EmojiEvents sx={{ color: 'gold' }} />}
            </Typography>
            <Typography variant="h6" ml={"20%"} sx={{color: (theme) => lastSeconds ? theme.palette.error.main : theme.palette.grey[600]}}>
                {lastSeconds ? displayTimeWithMillisecond(time) : formatTime(time)}
            </Typography>
        </Card>
    );
};  
