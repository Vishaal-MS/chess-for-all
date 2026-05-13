import { Typography, Grid, Box, Tooltip, Switch, FormControlLabel, IconButton, Popover, TextField } from "@mui/material";
import React, {useEffect, useState, useCallback} from "react";
import DiscussionBoard from "../discussion/DiscussionBoard.tsx";
import {Button, Confirm, useRecordContext} from "react-admin";
import { Info, OutlinedFlag } from "@mui/icons-material";
import { closeDialog, openDialog, remoteLog, useRealtimeComms } from "@mahaswami/vc-frontend";
import { getGamePGN, parseGameFromPgnStr, scrollToMove } from "./gameUtils.ts";
import { GAME_ACTIONS, GameModes } from "../../helpers/constants.ts";
import { getStudentId, isCoach, getUserId } from "../../businessLogic.ts";
import { useGamePlay } from "./GamePlayView.tsx";
import MovesTable from "./MovesTable.tsx";
import { Chess } from "chess.js";
import {FeedbackHeaderActions} from "./feedbackActions.tsx";

function getMovesFromPgn(pgn: string) {
    const notaGen = new NotationGenerator();
    if (!pgn) return;
    const game = parseGameFromPgnStr(pgn);
    const moves: any = []

    if (game?.mainLine && game.mainLine?.length > 0) {
        for (let i = 0; i < game.mainLine.length; i++) {
            const move = game.mainLine[i]
            const nota = notaGen.getMoveNota(game.mainLine[i]);
            // NOTE: This will only take anno type of POST_TEXT
            const anno = move?.getAnno();
            const postText = anno?.getPostText()?.split("|");
            const existingComment = postText?.[0]?.trim();
            const coachComment = postText?.[1]?.trim(); // coach comment
            const symbol = anno?.getSymbol()?.at(0);
            const timeTaken = anno?.getItem(7)?.getString();
            moves.push({nota, comment: existingComment, coachComment, symbol, timeTaken});
        }
    }
    return moves;
}


type ModeType =  "play" | "show" | "new" | "bot" | string
interface NotaTableProps {
    pgn: string;
    mode?:ModeType;
    players?: {player1: string, player2: string};
    actions?: {
        onWithdraw?: () => void;
        onAddComment?: (pgn: string) => Promise<void>;
    };
}

interface State {
    currentMove: number;
    moves: {nota: string, comment: string, coachComment: string, symbol?: number}[];
    movesWithFeedback: number[];
    movesWithFeedbackRequest: number[];
    isTeachMode: boolean,
    showedIndex: number
}

export const NotaTable = ({pgn, mode=GameModes.NEW, players, actions}: NotaTableProps) => {
    const record = useRecordContext();
    const realtimeComms = useRealtimeComms();
    const [state, setState] = useState<State>({
        currentMove: 1, 
        moves: [], 
        movesWithFeedback: [], 
        movesWithFeedbackRequest: [],
        isTeachMode: false,
        showedIndex: 1
    });
    const [showNotations, setShowNotations] = useState(false);
    const isExternalGame = !record?.player1_student_id && !record?.player2_student_id;
    const discussionTitle = isExternalGame ? 'Comments' : 'Feedback';

    const isNew = mode === GameModes.NEW;
    const isPlay = mode === GameModes.PLAY;
    const isShow = mode === GameModes.SHOW;
    const isBot = mode === GameModes.BOT;
    const {movesWithFeedback, moves, currentMove, movesWithFeedbackRequest, isTeachMode, showedIndex} = state;

    const getCurrentMoveFromKernel = () => {
        return window?.glApp?.panelMgr?.modules?.[0]?.getKernel?.()?.game?.getMoveIndex?.() || 0;
    };

    useEffect(() => {
        const currentMove = getCurrentMoveFromKernel();
        const parsedMoves = getMovesFromPgn(pgn);
        setTimeout(() => {
            const navListenerId = 
                window.glApp.panelMgr.modules[0]?.getKernel().game.addOnNavigateListener((game) => {
                    const currentGameIndex = game.getCurLineIndex();
                    const currentGameSide = game.cur.sd;
                    const isOnLastMove = game.isOnLastMove();
                    if (isPlay || isBot) {
                        let canMove = false;
                        // Only allow input if it's the current player's turn
                        if (isOnLastMove) {
                            canMove = currentGameSide === 0 && players?.player1?.id == getStudentId()
                                || currentGameSide === 1 && players?.player2?.id == getStudentId();
                        }
                        window.glApp.panelMgr.modules[0].getKernel().boardWin.allowInput = canMove;
                    } else if (isNew) {
                        window.glApp.panelMgr.modules[0].getKernel().boardWin.allowInput = isOnLastMove;
                    }
                    setState(prev => {
                        const showedIndex = prev.showedIndex < currentGameIndex && currentGameIndex;
                        return ({
                            ...prev,
                            currentMove: currentGameIndex == 0 ? 1 : currentGameIndex,
                            showedIndex: showedIndex || prev.showedIndex,
                        })
                    });
                    scrollToMove("center", currentGameIndex || 1);
                })
            // by default disable the notations for others
            const boardWin = window.glApp.panelMgr.modules[0].getKernel().boardWin;
            if (boardWin) {
                boardWin.symAnnosOnBoard = false;
            }
        }, 2000);

        setState(prev => ({
            ...prev,
            currentMove: currentMove || parsedMoves?.length,
            moves: parsedMoves,
        }));
    }, [pgn]);

    useEffect(() => {
        if (isNew || isPlay || isBot) return;

        const fetchMovesWithFeedback = async () => {
            const dataProvider = window.swanAppFunctions.dataProvider;
            try {
                const {data: discussionTopics} = await dataProvider.getList("discussion_topics", {
                    filter: {game_id: record?.id},
                    pagination: {page: 1, perPage: 1000},
                });

                const movesWithFeedback = discussionTopics.map(a => a?.move_number).filter(mn => mn);
                const movesWithFeedbackRequest = discussionTopics.map(a => a?.is_feedback_requested).filter(mn => mn);
                setState(prev => ({...prev, movesWithFeedback, movesWithFeedbackRequest}));
            } catch (error) {
                console.error("ERROR: While Fetching Game Analysis!", error);
            }
        };

        fetchMovesWithFeedback();

        const handleUpdate = (content: any) => {
            if (content?.data?.resource === "discussion_topics") {
                const moveNumber = content?.data?.move_number;
                if (moveNumber) {
                    setState(prev => ({
                        ...prev,
                        movesWithFeedback: [...prev.movesWithFeedback, moveNumber],
                    }));
                }
            }
        };

        realtimeComms.subscribe(`discussion_topics/${record.id}`, handleUpdate);
        return () => {
            realtimeComms.unsubscribe(`discussion_topics/${record.id}`, handleUpdate);
        };

    }, []);


    const handleGotoMove = (moveIndex: number) => {
        try {
            const kernel = window.glApp.panelMgr.modules?.[0].getKernel();
            kernel.game.gotoIndex(moveIndex);
        } catch (error) {
            console.log("ERROR: While Handle GotoMove", error);
        }
    };

    const handleColumnClick = useCallback((moveIndex: number) => {
        handleGotoMove(moveIndex);
        setState(prev => ({...prev, currentMove: moveIndex}));
    }, []);

    
    
    const removeLastMove = () => {
        const chess = new Chess();
        chess.loadPgn(getGamePGN());
        chess.undo();
        let kernel = window.glApp.panelMgr.modules?.[0].getKernel();
        const newPgn = chess.pgn();
        const newGame = parseGameFromPgnStr(newPgn);
        setTimeout(() => {
            newGame.setCurLineIndex(newGame.mainLine.length)
            kernel.game.assign(newGame);
            setState(prev => ({
                ...prev, 
                moves: getMovesFromPgn(newPgn),
                currentMove: prev.currentMove - 1,
            }));
        });
        kernel.boardWin.allowInput = true;
    }
    const currentUserId = getUserId();
    const iAmOneOfThePlayers = players?.player1?.user_id === currentUserId || players?.player2?.user_id === currentUserId;

    const handleShowNotations = () => {
        const nextShowNotations = !showNotations;
        setShowNotations(nextShowNotations);
        const boardWin = window.glApp.panelMgr.modules[0].getKernel().boardWin;
        if (boardWin) {
            // To toggle the symbol notations in board
            boardWin.symAnnosOnBoard = nextShowNotations;
        }
    }

    const handleAddComment = async (moveIndex: number, comment: string) => {
        if (moveIndex != null && comment) {
            const game = window.glApp.panelMgr.modules[0].getKernel().game;
            const anno = game.getOrCreateCurrAnno();
            if (anno.hasPostText()) {
                const existingComment = anno.getPostText()?.split("|")[0].trim()
                anno?.getItem(2)?.setString(existingComment + " | " + comment);
            } else {
                anno?.addPostText(" | " + comment); // create posttext and update comment
            }
            game.fireOnAnnoChanged();
            const pgn = getGamePGN();

            setState(prev => ({
                ...prev,
                moves: getMovesFromPgn(pgn),
            }));
            await actions?.onAddComment?.(pgn);
        }
        closeDialog()
    }

    const handleRemoveComment = async (moveIndex: number) => {
        if (moveIndex != null) {
            const game = window.glApp.panelMgr.modules[0].getKernel().game;
            const anno = game.getOrCreateCurrAnno();
            if (anno.hasPostText()) {
                const existingComment = anno.getPostText()?.split("|")[0].trim()
                if (existingComment) {
                    anno?.getItem(2)?.setString(existingComment);
                } else {
                    anno?.deleteItem(2); // remove posttext
                }
            }
            game.fireOnAnnoChanged();
            const pgn = getGamePGN();

            setState(prev => ({
                ...prev,
                moves: getMovesFromPgn(pgn),
            }));
            await actions?.onAddComment?.(pgn);
        }
        closeDialog()
    
    }


    const handleMoveActions = (action: string, payload: any) => {
        switch (action) {
            case "add_comment":
            case "edit_comment": {
                openDialog(
                    <AddCommentDialog 
                        mode={action == "add_comment" ? "add" : "edit"}
                        moveNota={state.moves[payload.moveIndex].nota}
                        onAddComment={async (comment) => handleAddComment(payload.moveIndex, comment)}
                        onRemove={async () => handleRemoveComment(payload.moveIndex)}
                        existingComment={state.moves[payload.moveIndex].coachComment}
                    />
                )
            }
        }
    }

    return (
        <Box sx={{display: "flex", flexDirection: "column", overflow: "auto", scrollbarWidth: "none"}}>
            <Grid item mb={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: "0.5rem", px: "1rem"}}> 
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1rem'}}>
                        Notation
                        {isShow && <Tooltip placement="top" title={`Click move to view ${discussionTitle.toLowerCase()}`}>
                            <Info sx={{ fontSize: '1.2rem', ml: '0.3rem'}}/>
                        </Tooltip>}
                    </Typography>
                    {isShow && isCoach() && (
                        <Box>
                            <FormControlLabel
                                control={<Switch size="small" />}
                                onChange={() => {
                                    handleColumnClick(1);
                                    const element = document.getElementById('notation-table');
                                    element?.focus();
                                    setState(preState => ({ 
                                        ...preState, 
                                        isTeachMode: !isTeachMode,
                                        showedIndex: 1,
                                    }))
                                }}
                                checked={isTeachMode}
                                sx={{
                                    "& .MuiFormControlLabel-label": {
                                        fontSize: "0.85rem",
                                        color: "text.secondary",
                                    },
                                }}
                                label="Teach Mode"
                            />
                            <FormControlLabel
                                control={<Switch size="small" />}
                                onChange={() => {
                                    handleShowNotations();
                                    const element = document.getElementById('notation-table');
                                    element?.focus();
                                }}
                                checked={showNotations}
                                sx={{
                                    m: 0, // remove default margin
                                    "& .MuiFormControlLabel-label": {
                                        fontSize: "0.85rem",
                                        color: "text.secondary",
                                    },
                                }}
                                label="Show Notations"
                            />
                        </Box>
                    )}
                </Box>
                <MovesTable 
                    moves={moves} 
                    onMoveSelect={handleColumnClick}
                    selectedIndex={currentMove}
                    removeLastMove={removeLastMove}
                    showNotations={showNotations}
                    movesWithFeedback={movesWithFeedback}
                    movesWithFeedbackRequest={movesWithFeedbackRequest}
                    mode={mode}
                    isTeachMode={isTeachMode}
                    showedIndex={showedIndex}
                    onMoveAction={handleMoveActions}
                />
            </Grid>
            {isPlay && iAmOneOfThePlayers && <GamePlayActions game={record}/>}
            {isBot && <BotGameActions game={record} actions={actions}/>}
            {(isShow && currentMove > 0) && (
                <Grid item>
                    <DiscussionBoard
                        allowMultipleTopic={false}
                        title={discussionTitle}
                        emptyText={`No ${discussionTitle} Yet`}
                        createLabel={`Give ${discussionTitle}`}
                        references={{
                            ref1: {id: record.id, name: "game_id"},
                            ref2: {id: currentMove, name: "move_number"},
                        }}
                        cardSx={{
                            ".discussion-board": { 
                                height: "calc(50vh - 8rem)",
                                overflow: "auto",
                                scrollbarWidth: "thin"
                            }
                        }}
                        headerActions={(discussionTopic: any) => (
                            <FeedbackHeaderActions discussionTopic={discussionTopic} move={currentMove}/>
                        )}
                    />
                </Grid>
            )} 
        </Box>
    );
};

const AddCommentDialog = ({ 
    mode,
    moveNota, 
    onAddComment, 
    onRemove,
    existingComment
}: { 
    mode: "add" | "edit",
    moveNota: string, 
    onAddComment: (comment: string) => Promise<void>,
    onRemove?: () => Promise<void>,
    existingComment?: string
}) => {
    const [isLoading, setLoading] = useState(false);
    const addCommentToPgn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData(event.currentTarget);
            const comment = formData.get("comment") as string;
            await onAddComment(comment?.trim());
        } catch (err) {
            remoteLog(`Error while addComment`, err);
        } finally {
            setLoading(false);
        }
    }

    const removeComment = async () => {
        try {
            setLoading(true);
            await onRemove?.();
        } catch (err) {
            remoteLog(`Error while removing comment`, err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={addCommentToPgn}>
            <Typography variant="h6">{mode === "add" ? "Add" : "Edit"} Comment for {moveNota}</Typography>
            <TextField
                label="Comment"
                name="comment"
                defaultValue={existingComment?.trim()}
                fullWidth
                multiline
                minRows={3}
                sx={{mt: '1rem'}}
            /> 
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "1rem"}}>

                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    label={mode === "add" ? "Add Comment" : "Update Comment"}
                    loading={isLoading}
                    disabled={isLoading}
                />
                {mode === "edit" && <Button 
                    type="button" 
                    variant="contained" 
                    color="error" 
                    sx={{ ml: "1rem"}} 
                    label={"Remove Comment"}
                    onClick={removeComment}
                    loading={isLoading}
                    disabled={isLoading}
                />}
            </Box>

        </form>
    )
}

const BotGameActions = ({game, actions} : {game: any, actions: any}) => {
    const [withdraw, setWithdraw] = useState(false);

    const handleWithDraw = async (response: "cancel" | "ok") => {
        if (response == "ok" && game) {
            actions.onWithdraw();
        }
        setWithdraw(false);
    }

    return (
        <>
            <Confirm
                title={"Withdraw"}
                isOpen={withdraw}
                onConfirm={() => handleWithDraw("ok")}
                onClose={() => handleWithDraw("cancel")}
                content="Are you sure you want to withdraw the game?"
            />
            <Box display="flex" gap={1} padding={"1rem"}>
                <Button label='Withdraw' variant="contained" color="inherit" startIcon={<OutlinedFlag/>}
                        sx={{flexGrow: 1, height: '2rem'}} onClick={() => setWithdraw(!withdraw)} />
            </Box>
        </>
    );
}

const GamePlayActions = ({ game }: { game: any }) => {
    const { sendEvent, gameState } = useGamePlay();
    const isGameStarted = !!gameState.pgn
    const [offerDraw, setOfferDraw] = useState(false);
    const [abandon, setAbandon] = useState(false);

    const handleOfferDrawResponse = async (response: "cancel" | "ok") => {
        if (response == "ok" && game) {
            await sendEvent({
                action: GAME_ACTIONS.OFFER_DRAW,
                payload: {
                    offeredBy: getStudentId(),
                }
            })
        }
        setOfferDraw(false);
    }

    const handleOfferAbandandResponse = async (response: "cancel" | "ok") => {
        if (response == "ok" && game) {
            await sendEvent({
                action: GAME_ACTIONS.WITHDRAWN,
                payload: {
                    withdrawnBy: getStudentId(),
                }
            })
        }
        setAbandon(false);
    }

    return (
        <>
            <Confirm
                title={"Withdraw"}
                isOpen={abandon}
                onConfirm={() => handleOfferAbandandResponse("ok")}
                onClose={() => handleOfferAbandandResponse("cancel")}
                content="Are you sure you want to withdraw the game?"
            />
            <Confirm
                title={"Offer Draw"}
                isOpen={offerDraw}
                onConfirm={() => handleOfferDrawResponse("ok")}
                onClose={() => handleOfferDrawResponse("cancel")}
                content="Do you want to offer a draw to your opponent?"
            />
            <Box display="flex" gap={1} padding={"1rem"}>
                <Button label='½ Offer Draw' variant="contained" color="inherit" disabled={!isGameStarted}
                    sx={{flexGrow: 1, height: '2rem' }} onClick={() => setOfferDraw(!offerDraw)} />
                <Button label='Withdraw' variant="contained" color="inherit" startIcon={<OutlinedFlag/>}
                    sx={{flexGrow: 1, height: '2rem'}} onClick={() => setAbandon(!abandon)} disabled={!isGameStarted}/>
            </Box>
        </>
    );
    
}
