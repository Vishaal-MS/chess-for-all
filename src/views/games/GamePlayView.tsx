import { useEffect, useState, createContext, useContext, useCallback, ReactNode, useRef } from "react";
import {
    SimpleShowLayout,
    Confirm,
    useGetRecordId,
    useRecordContext,
    useNotify,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { useRealtimeComms } from "@mahaswami/vc-frontend";
import { NotaBoardField } from "./NotaBoardField";
import { GAME_ACTIONS, GameEndResult, GAME_STATUS, UserRoles, GAME_RESULTS, PlayerColor } from "../../helpers/constants";
import { GameEndModal } from "./GameEndModal";
import { createFileFromPGN, updateGameById } from "../../backend/games";
import { GameContextType, GameEventType, GameStateType, GameResourceType, Player } from "./types";
import { Dialog } from "@mui/material";
import { Alert } from "@mui/material";
import { getStudentId, getUserId, isCoach, isStudent} from "../../backend/common_logics"
import { getGameResult, parseGameFromPgnStr, updateGameHeader, updateResultForPGN } from "./gameUtils";
import { getTimeControlText } from "../time_controls/timeControlUtils";

// -------- Context Setup --------

const GameContext = createContext<GameContextType | null>(null);

export const useGamePlay = () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGamePlay must be used inside GameProvider");
    return ctx;
};

// -------- Main Component --------

export const GamePlayView = ({classId}: { classId?: number }) => {
    const navigate = useNavigate();
    const realtimeComms = useRealtimeComms();
    const gameId = Number(useGetRecordId());
    const gameRecord = useRecordContext<GameResourceType>();
    const notify = useNotify();
    const navigateUrl = isCoach() || classId ? `/games/${gameId}/show` : '/enrollments';
    const dataProvider = window.swanAppFunctions.dataProvider;

    const [gameState, setGameState] = useState<GameStateType>({
        pgn: "",
        players: [] as any[],
        status: GAME_STATUS.NOT_STARTED,
        incrementBy: 0,
        lastMoveTime: new Date(),
    });
    const [showAcceptDraw, setShowAcceptDraw] = useState(false);
    const [alertMessage, setAlertMessage] = useState<ReactNode | boolean>(false);
    const [showInvitation, setShowInvitation] = useState(false);
    const [invitationMessage, setInvitationMessage] = useState<string | boolean>(false);
    const timeControlRef = useRef<any>(null);

    const showAlert = useCallback(async (message: ReactNode, timeout?: number, onMessage?: () => void) => {
        setAlertMessage(message);
        if (!timeout) return;
        await new Promise((resolve) => setTimeout(() => {
            setAlertMessage(false);
            resolve(true);
            onMessage?.();
        }, timeout));
    }, [])

    // TODO: Move this logic into reducer later.
    const handleGameEvents = useCallback(async (event: GameEventType) => {
        switch (event.action) {
            case GAME_ACTIONS.INIT_GAME:
                let gameResult = event.payload.result;
                let gameStatus = event.payload.status;
                let resultForMe = undefined;
                const player1StudentId = event.payload.player1_student_id;
                const player2StudentId = event.payload.player2_student_id;
                const students = await dataProvider.getList('students', {
                    filter: { id: [player1StudentId, player2StudentId] },
                    meta: { prefetch: ['users'] }
                });
                const player1Student = students?.filter((student: any) => student?.id === player1StudentId);
                const player2Student = students?.filter((student: any) => student?.id === player1StudentId);
                // Result for me after the game is over
                if (gameResult != null) {
                    // result = 1 -> draw, 2 -> white won, 0 -> black won
                    if (gameResult === GAME_RESULTS.DRAW) {
                        resultForMe = GameEndResult.DRAW;
                    } else {
                        const currentStudentId = getStudentId();
                        const iAmOneOfThePlayers = [event.payload.player1_student_id, event.payload.player2_student_id].some(id => id === currentStudentId);
                        if (iAmOneOfThePlayers) {
                            const iAmWhite = currentStudentId === event.payload.player1_student_id;
                            const iAmBlack = currentStudentId === event.payload.player2_student_id;

                            if ((gameResult === GAME_RESULTS.WHITE_WINS && iAmWhite) || (gameResult === GAME_RESULTS.BLACK_WINS && iAmBlack)) {
                                resultForMe = GameEndResult.WON;
                            } else if ((gameResult === GAME_RESULTS.WHITE_WINS && iAmBlack) || (gameResult === GAME_RESULTS.BLACK_WINS && iAmWhite)) {
                                resultForMe = GameEndResult.LOSE;
                            }
                        } else {
                            resultForMe = getGameResult(parseInt(gameResult));
                        }
                    }
                }
                let isWhiteTurn = true;
                if (event.payload?.pgn) {
                    const parsedGame = parseGameFromPgnStr(event.payload?.pgn || null);
                    parsedGame?.gotoLast()
                    isWhiteTurn = parsedGame?.getCurPos().sd == 0
                }
                const currentTime = Date.now();
                const lastMoveTime = new Date(event.payload.last_move_time).getTime();
                const baseP1 = event.payload.player1_time_number || 0;
                const baseP2 = event.payload.player2_time_number || 0;
                let player1RemainingTime = baseP1;
                let player2RemainingTime = baseP2;

                if (lastMoveTime && event.payload?.status === GAME_STATUS.IN_PROGRESS) {
                    if (isWhiteTurn) {
                        player1RemainingTime -= (currentTime - lastMoveTime);
                    } else {
                        player2RemainingTime -= (currentTime - lastMoveTime);
                    }
                }
                player1RemainingTime = Math.floor(player1RemainingTime);
                player2RemainingTime = Math.floor(player2RemainingTime);

                const initialGame: GameStateType = {
                    pgn: event.payload?.pgn || "",
                    status: event.payload?.status,
                    result: resultForMe,
                    players: [
                        {
                            id: event.payload.player1_student_id,
                            name: event.payload.player1_name,
                            user_id: player1Student.user_id,
                            hasAccepted: gameStatus === GAME_STATUS.PLAYER_1_ACCEPTED,
                            color: "white",
                            remainingTime: player1RemainingTime || 0,
                            consumedTime: 0
                        },
                        {
                            id: event.payload.player2_student_id,
                            name: event.payload.player2_name,
                            user_id: player2Student.user_id,
                            hasAccepted: gameStatus === GAME_STATUS.PLAYER_2_ACCEPTED,
                            color: "black",
                            remainingTime: player2RemainingTime || 0,
                            consumedTime: 0
                        },
                    ],
                    incrementBy: event.payload.time_control.increment_time_number,
                    currentPlayer: isWhiteTurn ? 
                        event.payload?.player1_student_id : event.payload?.player2_student_id,
                    lastMoveTime: event.payload?.last_move_time || new Date(),
                    createdBy: event.payload?.user,
                }
                setGameState(initialGame);

                const { players, status } = initialGame;
                const isGameInvited = status === GAME_STATUS.INVITED;

                const challengerName = players[0].name
                const receivedPlayerName = players[1].name
                const currentStudentId = getStudentId();

                const opponent = players.find(player => player.id !== currentStudentId)
                // challenger = i am one of the player and ive created the game
                const iAmOneOfThePlayers = players.some(player => player.id === currentStudentId);
                const iAmTheAcceptedPlayer = players.find(player => player.hasAccepted && player.id === currentStudentId);
                const iAmNotTheAcceptedPlayer = iAmOneOfThePlayers && !iAmTheAcceptedPlayer;
                const oneOfThemAccepted = players.some(player => player.hasAccepted);
                const iAmTheChallenger = player1Student.id === currentStudentId && event.payload?.user_id === getUserId();
                // Created by user_id is not in the players array then we consider this game is created by coach.
                const coachCreatedGame = [player1Student.user_id, player2Student.user_id].every(id => id !== event.payload?.user_id);
                const gameFinished = [GAME_STATUS.ENDED, GAME_STATUS.IN_COMPLETE, GAME_STATUS.IN_PROGRESS].includes(status);
                
                if (gameFinished) return;

                // Handle Invitation / Alert
                if ((isGameInvited && iAmTheChallenger) || (coachCreatedGame && iAmTheAcceptedPlayer)) {
                    showAlert(<>Waiting for <b>{opponent?.name}</b> to accept invitation...</>)
                }
                if (coachCreatedGame) {
                    // Shows invitation for not accepted players
                    if (iAmNotTheAcceptedPlayer || (isGameInvited && iAmOneOfThePlayers)) {
                        setShowInvitation(true);
                        const timeControlLabel = getTimeControlText(event.payload?.time_control);                        
                        const opponentPlayerName = event.payload.player1_student_id !== currentStudentId
                            ? event.payload.player1_name : event.payload.player2_name;
                        setInvitationMessage(`Coach invited you to a ${timeControlLabel} game against ${opponentPlayerName}.`)
                    } 
                    // After one of the player accepted alert coach one of them accepted
                    else if (!iAmOneOfThePlayers && oneOfThemAccepted) {
                        const acceptedByPlayer = players.find(p => p.hasAccepted);
                        const opponentPlayer = players.find(p => !p.hasAccepted);
                        showAlert(
                            <><b>{acceptedByPlayer?.name}</b> has Accepted the invitation, 
                            waiting for <b>{opponentPlayer?.name}</b> to accept invitation...</>
                        );
                    } else if (!oneOfThemAccepted && !iAmOneOfThePlayers) {
                        showAlert("Waiting for players to accept Invitation...")
                    }
                } else if (isGameInvited && !iAmTheChallenger) {
                    if (iAmOneOfThePlayers) {
                        const timeControlLabel = getTimeControlText(event.payload?.time_control);
                        setShowInvitation(true);
                        setInvitationMessage(`${challengerName} invited you to a ${timeControlLabel} game.`)
                    } else {
                        showAlert(
                            <>Waiting for <b>{receivedPlayerName}</b> to accept invitation...</>
                        );
                    }
                }
                // Update the game details to Game.
                updateGameHeader(event.payload);
                break;

            case GAME_ACTIONS.MOVE:
                setGameState((prev) => {
                    const now = Date.now();                    
                    const players = event.payload?.players as Player[] || prev.players;

                    const updatedPlayers = prev.players.map(player => {
                        const serverPlayer = players.find(p => p.id === player.id);
                        if (!serverPlayer) return player;

                        if (player.id === prev.currentPlayer) {
                            const playerRemainingTime = serverPlayer.remainingTime + (prev.incrementBy * 1000);
                            return { 
                                ...player,
                                remainingTime: Math.max(0, playerRemainingTime), 
                                consumedTime: player.remainingTime - serverPlayer.remainingTime
                            };
                        }
                        return player;
                    });

                    // 1. We don't need a async/await because this is a Synchronization task
                    // 2. The main purpose of this call is to store the update time and pgn.
                    if (event.senderId == getUserId()) {
                        updateGame({
                            status: GAME_STATUS.IN_PROGRESS,
                            pgn: event.payload?.pgn,
                            last_move_time: new Date(now),
                            player1_time_number: updatedPlayers?.[0].remainingTime,
                            player2_time_number: updatedPlayers?.[1].remainingTime,
                        }, false);
                    }

                    return {
                        ...prev,
                        pgn: event.payload?.pgn,
                        currentPlayer:
                            prev.currentPlayer === prev.players[0]?.id
                                ? prev.players[1]?.id
                                : prev.players[0]?.id,
                        players: updatedPlayers,
                        lastMoveTime: new Date(now),
                    };
                });
                break;

            case GAME_ACTIONS.GAME_JOINED:
                setGameState((prev) => ({
                    ...prev,
                    players: [...prev.players, event.payload?.player],
                }));
                break;

            case GAME_ACTIONS.GAME_OVER:
                const isCheckmateByMe = event.payload.wonBy === getStudentId();
                setGameState((prev) => {
                    const iAmOneOfThePlayers = prev.players.some(player => player.id === getStudentId());
                    const isDraw = event.payload.isDraw;
                    let gameOverResult = getGameResult(parseInt(event.payload?.result)); // for other
                    if (iAmOneOfThePlayers) {
                        if (isDraw) {
                            gameOverResult = GameEndResult.DRAW;
                        } else if (isCheckmateByMe) {
                            gameOverResult = GameEndResult.WON;
                        } else {
                            gameOverResult = GameEndResult.LOSE;    
                        }
                    }

                    return ({
                        ...prev,
                        status: GAME_STATUS.ENDED,
                        result: gameOverResult,
                        reason: event.payload?.reason,
                        players: event.payload?.players || prev.players,
                    })
                });
                break;

            case GAME_ACTIONS.OPPONENT_DISCONNECTED:
                setGameState((prev) => ({ ...prev, status: GAME_STATUS.PAUSED }));
                break;

            case GAME_ACTIONS.SEND_INVITATION:
                setGameState((prev) => ({ ...prev, status: "pending" }));
                break;

            case GAME_ACTIONS.INVITATION_ACCEPTED:
                setGameState((prev) => {
                    const playerUserIds = prev.players.map(p => p.user_id);
                    const coachCreatedGame = playerUserIds.every(id => id !== prev.createdBy?.id);
                    const acceptedByPlayer = prev.players.find(p => p.id === event.payload?.acceptedBy);
                    const opponentPlayer = prev.players.find(p => p.id !== event.payload?.acceptedBy);
                    const iAmOneOfThePlayers = prev.players.some(player => player.id === getStudentId());
                    const iAmTheOpponent = opponentPlayer?.id === getStudentId();

                    // who has already accepted?
                    const alreadyAcceptedByPlayer = prev.players.find(
                        p => p.id !== event.payload?.acceptedBy && p.hasAccepted
                    );
                    let gameStatus = prev.status;

                    if (coachCreatedGame) {
                        if (alreadyAcceptedByPlayer) {
                            // both players accepted => start game
                            gameStatus = GAME_STATUS.IN_PROGRESS;
                            setShowInvitation(false);
                            showAlert("Invitations Accepted, Game on...", 890);
                        } else if (acceptedByPlayer?.id === getStudentId()) {
                            // I accepted first => wait for opponent
                            gameStatus = GAME_STATUS.WAITING;
                            setShowInvitation(false);
                            showAlert(
                                <>Waiting for <b>{opponentPlayer?.name}</b> to accept invitation...</>
                            );
                        } else {
                            if (!iAmOneOfThePlayers) {
                                gameStatus = GAME_STATUS.WAITING;
                                showAlert(
                                    <><b>{acceptedByPlayer?.name}</b> has Accepted the invitation, 
                                    waiting for <b>{opponentPlayer?.name}</b> to accept invitation...</>
                                );
                            } else {
                                // opponent accepted, waiting for me
                                notify(
                                    `${acceptedByPlayer?.name} has accepted the invitation, waiting for ${
                                        iAmTheOpponent ? "you" : opponentPlayer?.name
                                    } to accept.`,
                                    { multiLine: true }
                                );
                            }
                        }
                        return {
                            ...prev,
                            status: gameStatus,
                            players: prev.players.map(p =>
                                p.id === acceptedByPlayer?.id ? { ...p, hasAccepted: true } : p
                            ),
                        };
                    } else {
                        showAlert("Invitation Accepted, Game on...", 890)
                        setShowInvitation(false)
                        return ({
                            ...prev,
                            status: GAME_STATUS.IN_PROGRESS,
                            lastMoveTime: new Date(Date.now()),
                        });
                    }
                });
                break;

            case GAME_ACTIONS.INVITATION_REJECTED: 
                setGameState((prev) => {
                    const isCoachInvitation = event.payload?.isInvitationFromCoach;
                    const rejectedPlayer = prev.players.find(player => player.id === event.payload?.rejectedBy);
                    const iAmTheRejectedPlayer = rejectedPlayer?.id === getStudentId();
                    const url: any = (classId || !isStudent()) ? -1 : '/enrollments';
                    if (isCoachInvitation) {
                        // Handle coach Invitation Rejection
                        setShowInvitation(false)
                        showAlert(<><b>{rejectedPlayer?.name}</b> Rejected the Coach Invitation!</>, 1200, () => navigate(url));
                    } else if (!iAmTheRejectedPlayer) {
                        showAlert(<><b>{rejectedPlayer?.name}</b> Rejected the invitation!</>, 1200, () => navigate(url));
                    }
                    return ({
                        ...prev,
                        status: GAME_STATUS.IN_COMPLETE,
                        reason: event.payload?.reason,
                    })
                });
                break;
            case GAME_ACTIONS.OFFER_DRAW: 
                setGameState(prev => {
                    const iAmOneOfThePlayers = prev.players.some(player => player.id === getStudentId());
                    const offeredByPlayer = prev.players.find(player => player.id === event.payload?.offeredBy);
                    const iAmTheReceiver = event.payload?.offeredBy !== getStudentId();
                    if (iAmOneOfThePlayers) {
                        setShowAcceptDraw(iAmTheReceiver);
                    } else {
                        showAlert(<><b>{offeredByPlayer?.name}</b> has offered a draw.</>)
                    }
                    return prev;
                })
                break;
            case GAME_ACTIONS.DRAW_ACCEPTED:
                setGameState((prev) => {
                    const acceptedByPlayer = prev.players.find(player => player.id === event.payload?.acceptedBy);
                    const isAcceptedByMe = event.payload?.acceptedBy === getStudentId();
                    return ({
                        ...prev,
                        status: GAME_STATUS.ENDED,
                        result: GameEndResult.DRAW,
                        reason: `${isAcceptedByMe ? "You" : acceptedByPlayer?.name} Accepted the draw.`
                    })
                });
                setAlertMessage(false)
                break;
            case GAME_ACTIONS.DRAW_REJECTED:
                const isRejectedByMe = event.payload?.rejectedBy === getStudentId();
                setAlertMessage(false)
                if (isRejectedByMe) {
                    // Do nothing
                } else {
                    notify("Draw offer rejected.", { type: "info" });
                }
                break;
            case GAME_ACTIONS.WITHDRAWN: {
                const isWithdrawnByMe = event.payload?.withdrawnBy === getStudentId();
                setGameState(prev => {
                    const withdrawnPlayer = prev.players.find(
                        (player) => player.id === event.payload?.withdrawnBy
                    );
                    if (isWithdrawnByMe) {
                        navigate(navigateUrl, { state: { status: GAME_STATUS.WITHDRAWN }});
                        return prev;
                    } else {
                        const opponentPlayer = prev.players.find(
                            (player) => player.id !== event.payload?.withdrawnBy
                        );
                        const isWhiteWithdraw = withdrawnPlayer?.color === PlayerColor.WHITE;
                        const iAmTheOpponent = opponentPlayer?.id == getStudentId();
                        
                        return {
                            ...prev,
                            status: GAME_STATUS.ENDED,
                            result: iAmTheOpponent ? GameEndResult.WON : 
                                isWhiteWithdraw ? GameEndResult.BLACK_WON : GameEndResult.WHITE_WON,
                            reason: `${withdrawnPlayer?.name} Withdrawn the game.`,
                        };
                    }
                });
                break;
            }
            default:
                break;
        }
    }, [gameRecord]);

    useEffect(() => {
        // Init the game with the game record..
        if (gameRecord) {
            handleGameEvents({
                action: GAME_ACTIONS.INIT_GAME,
                payload: gameRecord,
            });
        }
        return () => {
            setGameState({
                pgn: "",
                players: [],
                status: GAME_STATUS.NOT_STARTED,
                incrementBy: 0,
                lastMoveTime: new Date(),
            });
            setAlertMessage(false);
            setShowInvitation(false);
            setShowAcceptDraw(false);
            setInvitationMessage(false);
        }
    }, [gameRecord])

    useEffect(() => {
        // Subscribe only for events from *other* players
        const listener = (event: GameEventType) => {
            if (event.senderId !== getUserId()) {
                handleGameEvents(event);
            }
        };

        realtimeComms.subscribe(`games/${gameId}`, listener);
        return () => {
            realtimeComms.unsubscribe(`games/${gameId}`, listener);
        };
    }, [realtimeComms, gameId]);

    const updateGame = useCallback(async (data: any, shouldCreateFile = true) => {
        // If pgn changes create the the pgn file and upload
        if (shouldCreateFile && data.pgn) {
            const {file, blobUrl} = createFileFromPGN(data.pgn, gameId);
            data.pgn_attachment_file_id = {
                rawFile: file,
                src: blobUrl,
                title: file.name
            }
        }
        await updateGameById(gameId, data)
    }, [gameId])


    const sendEvent = useCallback(async (event: GameEventType) => {
        event.senderId = getUserId();
        // Apply locally first (optimistic UI)
        handleGameEvents(event);

        // Then broadcast to others
        realtimeComms.publish(`games/${gameId}`, {
            ...event,
            senderId: getUserId(),
        });

        // Important event update database
        switch (event.action) {
            case GAME_ACTIONS.GAME_OVER:
                await updateGame({
                    status: GAME_STATUS.ENDED,
                    result: event.payload?.result?.toString(),
                    pgn: event.payload?.pgn,
                    player1_time_number: event.payload?.players?.[0].remainingTime,
                    player2_time_number: event.payload?.players?.[1].remainingTime,
                }, true);
                break;
            case GAME_ACTIONS.INVITATION_ACCEPTED:
                const startTime = new Date(Date.now());
                const playerUserIds = gameState.players.map(player => player.user_id);
                const coachCreatedGame = playerUserIds.every(id => id !== gameState.createdBy?.id);
                const acceptedById = event.payload?.acceptedBy;
                let gameStatus = GAME_STATUS.IN_PROGRESS;
                const noneOfThemAccepted = event.payload?.onePlayerAccepted === false;

                // Put the accepted player in the status
                if (coachCreatedGame && noneOfThemAccepted) {
                    const acceptedPlayer = gameState.players.find(player => player.id === acceptedById);
                    const acceptedByPlayer1 = acceptedPlayer?.id === gameState.players[0]?.id;
                    const acceptedByPlayer2 = acceptedPlayer?.id === gameState.players[1]?.id;
                    // accepted by p1 => player_1_accepted : p2 => player_2_accepted;
                    gameStatus = acceptedByPlayer1 ? GAME_STATUS.PLAYER_1_ACCEPTED :
                        acceptedByPlayer2 ? GAME_STATUS.PLAYER_2_ACCEPTED : GAME_STATUS.WAITING;
                }
                await updateGame({
                    status: gameStatus,
                    last_move_time: startTime
                });
                break;
            case GAME_ACTIONS.INVITATION_REJECTED:
                await updateGame({
                    status: GAME_STATUS.IN_COMPLETE,
                });
                break;
            case GAME_ACTIONS.DRAW_ACCEPTED:
                const updatedPGN = updateResultForPGN(gameState.pgn, GAME_RESULTS.DRAW);
                await updateGame({
                    status: GAME_STATUS.ENDED,
                    result: GAME_RESULTS.DRAW,
                    pgn: updatedPGN,
                    player1_time_number: event.payload?.players?.[0].remainingTime,
                    player2_time_number: event.payload?.players?.[1].remainingTime,
                }, true);
                break;
            case GAME_ACTIONS.WITHDRAWN: {
                const isWithdrawnByMe = event.payload?.withdrawnBy === getStudentId();
                const iAmWhite = gameState.players[0]?.id === getStudentId();
                const gameResult = isWithdrawnByMe && iAmWhite ? GAME_RESULTS.BLACK_WINS : GAME_RESULTS.WHITE_WINS
                const updatedPGN = updateResultForPGN(gameState.pgn, gameResult);
                await updateGame({
                    status: GAME_STATUS.ENDED,
                    result: gameResult,
                    pgn: updatedPGN,
                    player1_time_number: event.payload?.players?.[0].remainingTime,
                    player2_time_number: event.payload?.players?.[1].remainingTime,
                }, true);
                break;
            }
            default:
                break;
        }
    }, [handleGameEvents, realtimeComms, gameId, gameState]);

    // Tick Handler
    useEffect(() => {
        if (gameState.status !== GAME_STATUS.IN_PROGRESS || gameState.result) {
            cancelAnimationFrame(timeControlRef.current);
            timeControlRef.current = 0;
            return;
        };

        let lastTime = Date.now();

        const tick = () => {
            const now = Date.now();
            const delta = now - lastTime;
            lastTime = now;

            setGameState(prev => {
                const updatedPlayers = prev.players.map(player => {
                    if (player.id === prev.currentPlayer) {
                        return {
                            ...player,
                            remainingTime:  Math.max(0, player.remainingTime - delta),
                            consumedTime:  Math.max(0, player.consumedTime + delta),
                        };
                    }
                    return player;
                });
                const currentTime = new Date(Date.now());
                const movedPlayerIndex = prev.players?.findIndex(player => player.id === prev.currentPlayer);
                const current = prev.players[movedPlayerIndex];

                 if (current.remainingTime <= 0 && prev.status === GAME_STATUS.IN_PROGRESS) {
                    clearInterval(timeControlRef.current);
                    timeControlRef.current = 0;
                    sendEvent({
                        action: GAME_ACTIONS.GAME_OVER,
                        payload: {
                            result: current.color === PlayerColor.WHITE 
                                ? GAME_RESULTS.BLACK_WINS 
                                : GAME_RESULTS.WHITE_WINS,
                            wonBy: prev.players.find(p => p.id !== current.id)?.id,
                            reason: "Time out",
                            pgn: prev.pgn,
                            players: updatedPlayers
                        }
                    });
                    return prev;
                }

                return { 
                    ...prev, 
                    players: updatedPlayers,
                    lastMoveTime: currentTime, 
                };
            });

            timeControlRef.current = requestAnimationFrame(tick);
        };

        timeControlRef.current =  requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(timeControlRef.current);
            timeControlRef.current = 0;
        };
    }, [gameState.status, gameState.result]);


    return (
        <GameContext.Provider value={{ gameState, gameRecord, sendEvent, setGameState }}>

            {/* Main Game Board */}
            <SimpleShowLayout>
                <NotaBoardField 
                    realtimeComms={realtimeComms} 
                    mode="play" 
                    sendEvent={sendEvent}
                    players={gameState.players}
                    currentPlayer={gameState.currentPlayer}
                />
            </SimpleShowLayout>

            {/* Game Invitation Dialog */}
            <Confirm
                isOpen={showInvitation}
                title={"Game Invitation"}
                content={invitationMessage}
                onConfirm={async () => {
                    let isInvitationFromCoach = gameState.createdBy?.role == UserRoles.PRO_COACH;
                    const onePlayerAccepted = gameState.players.some(player => player.hasAccepted);
                    await sendEvent({ 
                        action: GAME_ACTIONS.INVITATION_ACCEPTED, 
                        payload: { isInvitationFromCoach, onePlayerAccepted, acceptedBy: getStudentId() } 
                    });
                }}
                // @ts-ignore
                onClose={async (_event: any, reason: any) => {
                    if (reason == "backdropClick") {
                        return; // disable click outside close dialog
                    }
                    let isInvitationFromCoach = gameState.createdBy?.role == UserRoles.PRO_COACH;
                    await sendEvent({ 
                        action: GAME_ACTIONS.INVITATION_REJECTED, 
                        payload: { isInvitationFromCoach, rejectedBy: getStudentId() } 
                    });                    
                    navigate(-1);
                }}
                confirm="Accept"
                cancel="Reject"
            />

            {/* Shows Game Status in Dialog (waiting for opponent, accepted, etc...) */}
            {gameState.status && (
                <Dialog open={Boolean(alertMessage)}>
                    <Alert                    
                        severity={gameState.status == GAME_STATUS.IN_PROGRESS ? "success" : "info"}
                    >{alertMessage}</Alert>
                </Dialog>
            )}

            {/* Opponent Requested Draw Offer */}
            <Confirm
                isOpen={showAcceptDraw}
                title="Accept Draw?"
                content="Your opponent has offered a draw"
                onConfirm={async () => {
                    await sendEvent({ 
                        action: GAME_ACTIONS.DRAW_ACCEPTED, 
                        payload: { acceptedBy: getStudentId(), players: gameState.players } 
                    });
                    setShowAcceptDraw(false);
                }}
                onClose={async () => {
                    await sendEvent({ 
                        action: GAME_ACTIONS.DRAW_REJECTED, 
                        payload: { rejectedBy: getStudentId() } 
                    });
                    setShowAcceptDraw(false);
                }}
                confirm="Accept"
                cancel="Reject"
            />

            {/* Game End Result modal to show result */}
            {gameState.result && (
                <GameEndModal
                    open={true}
                    result={gameState.result}
                    reason={gameState.reason}
                    onClose={() => navigate(navigateUrl)}
                />
            )}
        </GameContext.Provider>
    );
};
