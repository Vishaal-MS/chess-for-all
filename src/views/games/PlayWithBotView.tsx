import React, { useReducer, useEffect } from "react";
import {SimpleShowLayout, useNotify, useRecordContext} from "react-admin";
import { NotaBoardField } from "./NotaBoardField";
import { GameEndModal } from "./GameEndModal";
import { GAME_RESULTS, GAME_STATUS, GameEndResult, GameModes } from "../../helpers/constants";
import { useNavigate } from "react-router-dom";
import { applyResult, disableBoard, getGamePGN, parseGameFromPgnStr } from "./gameUtils";
import { getStudentId } from "../../businessLogic";
import { createPGNFileAndUpdateGame } from "../../backend/games";

export type Player = {
    id: string | null;
    name: string;
    color: "white" | "black";
    remainingTime: number;
    isBot: boolean;
    elapsedTime: number;
};

export const BOT_ACTIONS = {
    NAVIGATE_BACK: "navigate-back",
    UPDATE_TIMER: "tick",
    SWITCH_TURN: "switch-turn",
    GAME_OVER: "game-over",
    INITIALIZE_GAME: "initialize-game",
    GAME_STARTED: "game-started"

};

interface State {
    players: Player[];
    activePlayer: "white" | "black";
    gameState: { result: string | null; reason: string | null };
    isTimeOut: boolean;
    lastMoveTime: Date;
    isGameStarted: boolean;
}

type Action =
    | { type: typeof BOT_ACTIONS.UPDATE_TIMER }
    | { type: typeof BOT_ACTIONS.SWITCH_TURN; payload: { currentTime: Date; activePlayer: "white" | "black", increment: number } }
    | { type: typeof BOT_ACTIONS.GAME_OVER; payload: { result: string; reason: string } }
    | { type: typeof BOT_ACTIONS.INITIALIZE_GAME; payload: State }
    | { type: typeof BOT_ACTIONS.GAME_STARTED; payload: { isGameStarted: boolean } };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case BOT_ACTIONS.UPDATE_TIMER: {
            if (state.gameState.result) return state;

            const activeIndex = state.activePlayer === "white" ? 0 : 1;
            const active = state.players[activeIndex];

            if (active.remainingTime <= 100) {
                disableBoard(); // prevent move after time out.
                return {
                    ...state,
                    players: state.players.map((p, i) =>
                        i === activeIndex ? { ...p, remainingTime: 0 } : p
                    ),
                    isTimeOut: true,
                };
            }

            return {
                ...state,
                players: state.players.map((p, i) =>
                    i === activeIndex ? { ...p, remainingTime: p.remainingTime - 100, elapsedTime: p.elapsedTime + 100 } : { ...p, elapsedTime: 0 }
                ),
            };
        }

        case BOT_ACTIONS.SWITCH_TURN: {
            if (state.gameState.result) return state;

            const now = action.payload.currentTime;
            const playerIndex = action.payload.activePlayer === "white" ? 1 : 0;
            const increment = (action.payload.increment || 0); // convert seconds to ms

            let updatedPlayers = [...state.players];

            const newTime = Math.max(0, updatedPlayers[playerIndex].remainingTime);
            updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                remainingTime: newTime + increment,
            };

            const isTimeOut = newTime === 0;

            return {
                ...state,
                players: updatedPlayers,
                activePlayer: action.payload.activePlayer,
                isTimeOut,
                lastMoveTime: now,
            };
        }

        case BOT_ACTIONS.GAME_OVER: {
            const { result, reason } = action.payload;
            return { ...state, gameState: { result, reason } };
        }

        case BOT_ACTIONS.INITIALIZE_GAME: {
            return action.payload;
        }

        case BOT_ACTIONS.GAME_STARTED: {
            return {...state, isGameStarted: action.payload.isGameStarted}
        }

        default:
            return state;
    }
};

const PlayWithBotView = () => {
    const navigate = useNavigate();
    const record = useRecordContext();
    const notify = useNotify();

    // Convert base times and increment to milliseconds
    const baseWhite = (record?.player1_time_number);
    const baseBlack = (record?.player2_time_number);
    const increment = (record?.time_control?.increment_time_number || 0) * 1000;

    const [state, dispatch] = useReducer(reducer, {
        players: [],
        activePlayer: "white",
        gameState: { result: null, reason: null },
        isTimeOut: false,
        lastMoveTime: new Date(),
        isGameStarted: false,
    });

    const handleBack = () => navigate(-1);

    const botGameEvent = async (action: string, payload: any) => {
        if (action === BOT_ACTIONS.NAVIGATE_BACK) {
            handleBack();
        } else if (action === BOT_ACTIONS.GAME_OVER) {
            dispatch({ type: BOT_ACTIONS.GAME_OVER, payload });
        } else if (action === BOT_ACTIONS.SWITCH_TURN) {
            dispatch({
                type: BOT_ACTIONS.SWITCH_TURN,
                payload: { currentTime: payload.currentTime, activePlayer: payload.activePlayer, increment },
            });
        }
    };

    // Update only current player's clock every 100ms (for ms precision)
    useEffect(() => {
        if (!record || state.gameState.result || state.isGameStarted === false) return;

        const interval = setInterval(() => {
            dispatch({ type: BOT_ACTIONS.UPDATE_TIMER });
        }, 100);

        return () => clearInterval(interval);
    }, [record, state.gameState.result, state.activePlayer, state.isGameStarted]);

    useEffect(() => {
        if (!state.isTimeOut) return;

        const playerIsWhite = !!record?.player1_student_id;
        let result = GameEndResult.WON;
        let winner = "white_wins";

        if (playerIsWhite && state.activePlayer === "white") {
            result = GameEndResult.LOSE;
            winner = "black_wins";
        } else if (!playerIsWhite && state.activePlayer === "black") {
            result = GameEndResult.LOSE;
            winner = "white_wins";
        }

        applyResult(winner);
        const pgn = getGamePGN();
        const payload = {
            status: GAME_STATUS.ENDED,
            result: state.activePlayer === "white" ? "0" : "2", // 0-black_wins, 2-white_wins 
            pgn,
            player1_time_number: state.players?.[0]?.remainingTime,
            player2_time_number: state.players?.[1]?.remainingTime,
            last_move_time: state.lastMoveTime,
        };
        dispatch({ type: BOT_ACTIONS.GAME_OVER, payload: { result, reason: "Time out" } });
        createPGNFileAndUpdateGame(record?.id, pgn, payload);
    }, [state.isTimeOut, record, state.activePlayer, state.players]);

    useEffect(() => {
        if (!record) return;
        const isP1Bot = record.player1_student_id === null;
        let initialActivePlayer: "white" | "black" = "white";
        let initialTimestamp = record?.last_move_time ? new Date(record?.last_move_time) : new Date();

        if (record?.pgn) {
            const parsedGame = parseGameFromPgnStr(record?.pgn || null);
            parsedGame?.gotoLast();
            initialActivePlayer = parsedGame?.getCurPos().sd === 0 ? "white" : "black";
        }

        //TODO: Need to validate the result before game load.
        let gameResult = { result: null, reason: null } as { result: string | null; reason: string | null };
        if (record.result === GAME_RESULTS.DRAW) {
            gameResult = { result: GameEndResult.DRAW, reason: "Draw" };
        } else {
            const currentStudentId = getStudentId();
            const iAmOneOfThePlayers = [record.player1_student_id, record.player2_student_id].some(id => id === currentStudentId);
            if (iAmOneOfThePlayers) {
                const iAmWhite = currentStudentId === record.player1_student_id;
                const iAmBlack = currentStudentId === record.player2_student_id;
                if ((record.result === GAME_RESULTS.WHITE_WINS && iAmWhite) || (record.result === GAME_RESULTS.BLACK_WINS && iAmBlack)) {
                    gameResult = { result: GameEndResult.WON, reason: null };
                } else if ((record.result === GAME_RESULTS.WHITE_WINS && iAmBlack) || (record.result === GAME_RESULTS.BLACK_WINS && iAmWhite)) {
                    gameResult = { result: GameEndResult.LOSE, reason: null };
                }
            } else {
                gameResult = { result: record.result === GAME_RESULTS.WHITE_WINS ? GameEndResult.WHITE_WON : GameEndResult.BLACK_WON, reason: null };
            }
        }

        dispatch({
            type: BOT_ACTIONS.INITIALIZE_GAME,
            payload: {
                players: [
                    { id: isP1Bot ? null : record.player1_student_id, name: record.player1_name, color: "white", remainingTime: baseWhite, isBot: isP1Bot, elapsedTime: 0 },
                    { id: !isP1Bot ? null : record.player2_student_id, name: record.player2_name, color: "black", remainingTime: baseBlack, isBot: !isP1Bot, elapsedTime: 0 },
                ],
                activePlayer: initialActivePlayer,
                gameState: { ...gameResult },
                isTimeOut: false,
                lastMoveTime: initialTimestamp,
                isGameStarted: false
            },
        });

        setTimeout(() => { // Wait until chess board load
            const isEnded = !!record?.result
            dispatch({type: BOT_ACTIONS.GAME_STARTED, payload: {isGameStarted: !isEnded}});
            if (!isEnded) {
                const isNewGame = !record?.last_move_time;
                notify(isNewGame ? "Game Started" : "Game Resumed");
            }
        }, 1500);

    }, [record]);

    return (
        <SimpleShowLayout>
            <NotaBoardField
                mode={GameModes.BOT}
                players={state.players}
                currentPlayer={state.activePlayer}
                botGameEvent={botGameEvent}
            />

            {state.gameState.result && (
                <GameEndModal
                    open={true}
                    result={state.gameState.result}
                    reason={state.gameState.reason}
                    onClose={handleBack}
                />
            )}
        </SimpleShowLayout>
    );
};

export default PlayWithBotView;
