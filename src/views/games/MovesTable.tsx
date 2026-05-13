import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, IconButton, Tooltip, Grid, Chip, useTheme } from "@mui/material";
import { Delete, EditNote, Forum, NoteAdd } from "@mui/icons-material";
import { GameModes, getSymbolColor, NotaSymbols } from "../../helpers/constants";
import { scrollToMove } from "./gameUtils";

type MoveType = {
    nota: string;
    comment: string;
    coachComment: string;
    symbol?: number;
    timeTaken?: string;
}

type NotationTableProps = {
    onMoveSelect?: (index: number) => void;
    moves: MoveType[],
    selectedIndex: number,
    removeLastMove?: () => void,
    movesWithFeedback?: number[],
    mode?: string,
    showNotations?: boolean,
    movesWithFeedbackRequest?: number[],
    isTeachMode: boolean,
    showedIndex: number,
    onMoveAction?: (action: string, payload: any) => void;
};

const MovesTable = ({ 
    onMoveSelect, 
    moves, 
    selectedIndex, 
    removeLastMove, 
    movesWithFeedback,
    mode,
    showNotations = false,
    isTeachMode,
    showedIndex,
    onMoveAction
}: NotationTableProps) => {

    const isNew =  mode === GameModes.NEW;
    const isShow = mode === GameModes.SHOW;
    const isAnyPlay = [GameModes.PLAY, GameModes.BOT].includes(mode);
    const tableRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!tableRef.current) return;
        scrollToMove("center", selectedIndex);
    }, [moves])

    // Group moves in pairs
    const movePairs = useMemo(() => {
        if (!moves) return [];
        const result: MoveType[][] = [];
        for (let i = 0; i < moves.length; i += 2) {
            result.push(moves.slice(i, i + 2));
        }
        return result;
    }, [moves]);

    return (
        <Box
            onKeyDown={(e) => {
                if (selectedIndex == null) return;
                if (e.key === "ArrowRight") {
                    if (selectedIndex < moves.length) {
                        onMoveSelect?.(selectedIndex + 1);
                    }
                } else if (e.key === "ArrowLeft") {
                    if (selectedIndex > 1) {
                        onMoveSelect?.(selectedIndex - 1);
                    }
                }
            }}
        >
            <Box
                ref={tableRef}
                className="notation-table-container"
                sx={{
                    maxHeight: isAnyPlay ? "calc(68vh - 8rem)" : "calc(50vh - 8rem)",
                    minHeight: isNew ? "45vh" : isAnyPlay ?  "64vh" : "40vh",
                    [theme.breakpoints.down("md")]: {
                        minHeight: "45vh",
                        maxHeight: "calc(45vh - 8rem)",
                    },
                    overflowY: "auto",
                    fontSize: "14px",
                }}
                
            >
                <Grid
                    sx={{
                        display: "grid",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        gridTemplateColumns: "40px 1fr 1fr",
                        px: 2,
                        py: 0.5,
                        fontWeight: "bold",
                        bgcolor: (theme) => theme.palette.background.default,
                    }}
                >
                    <Grid item>#</Grid>
                    <Grid item>White</Grid>
                    <Grid item>Black</Grid>
                </Grid>
                
                {movePairs.map((pair, index) => (
                    <Box key={index}>
                        <Grid
                            sx={{
                                display: "grid",
                                alignItems: "self-start",
                                gridTemplateColumns: "40px 1fr 1fr",
                                px: "1rem",
                                py: "0.2rem",
                                bgcolor: (theme) =>
                                    index % 2 ? theme.palette.background.default : "transparent",
                            }}
                        >
                            <Typography sx={{ marginTop: "0.3rem"}}>{!isTeachMode || showedIndex / 2 > index ? index + 1 + '.' : ''}</Typography>
                            {pair.map((move, moveIndex) => {
                                const absIndex = index * 2 + (moveIndex + 1);
                                const isHighlighted = selectedIndex === absIndex;
                                const isLastMove = absIndex === moves.length;
                                const getSelectedBgColor = (theme: any) => {
                                    return theme.palette.mode === "light"
                                        ? theme.palette.secondary.light
                                        : theme.palette.secondary.dark;
                                }
                                const hasAnalysis = movesWithFeedback?.includes(absIndex);
                                const isVisibleMove = absIndex <= showedIndex || !isTeachMode;
                                const symbolText = move.symbol ? NotaSymbols[move.symbol] : "";
                                const symbolColor = getSymbolColor(symbolText);
                                const isExpanded = expandedComments[absIndex] || false;

                                return (
                                    <Grid
                                        item
                                        key={absIndex}
                                        id="notation-table"
                                        data-move-index={absIndex}
                                        sx={{
                                            px: 1,
                                            py: "0.3rem",
                                            height: "100%",
                                            borderRadius: 1,
                                            cursor: "pointer",
                                            outline: "none",
                                            "&:hover": isVisibleMove ? {
                                                bgcolor: theme => isHighlighted ? 
                                                    getSelectedBgColor(theme) : theme.palette.action.hover,  
                                                "#move-edit": {
                                                    display: "flex",
                                                },
                                            } : {},
                                            bgcolor: (theme) =>
                                                isHighlighted
                                                    ? getSelectedBgColor(theme)
                                                    : "transparent",
                                        }}
                                        tabIndex={0}
                                        onClick={() => {
                                            if (isVisibleMove)
                                                onMoveSelect?.(absIndex);
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            {symbolText && isVisibleMove && showNotations && (
                                                <Box
                                                    sx={{
                                                        minWidth: "1.2rem",
                                                        height: "1.2rem",
                                                        borderRadius: "50%",
                                                        bgcolor: symbolColor,
                                                        color: "white",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "bold",
                                                        mr: 0.5,
                                                    }}
                                                >
                                                    {symbolText}
                                                </Box>
                                            )}
                                            <Box sx={{ display: "flex", height: "1.5rem", alignItems: "center", flexGrow: 1, gap: "0.5rem" }}>
                                                <Typography
                                                    sx={{ 
                                                        display: isVisibleMove ? "flex" : "none",
                                                        fontSize: "1.1rem",
                                                        fontFamily: "monospace",
                                                        color: theme => showNotations && symbolColor || theme.palette.text.primary,
                                                        alignItems: "center", gap: "0.4rem"
                                                    }}
                                                >
                                                    {move.nota}
                                                    {isShow && move.timeTaken && move.timeTaken !== '0' &&
                                                        <Chip label={<Typography color="textSecondary" variant="body2">{move.timeTaken}</Typography>} 
                                                            size="small" sx={{ height: '1.3rem', minWidth: '2.6rem'}}/>}
                                                </Typography>
                                                {hasAnalysis && isVisibleMove && 
                                                    <Forum sx={{ fontSize: "1.1rem", mr: 0.5 }} color="primary" />
                                                }
                                            </Box>
                                            {isNew && isLastMove && 
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        opacity: 0.6,
                                                        transition: "0.2s",
                                                        "&:hover": { color: "error.main", opacity: 1 },
                                                    }}
                                                    onClick={removeLastMove}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            }
                                            {showNotations && isVisibleMove && isHighlighted && (
                                                <>
                                                    <Tooltip title={move.coachComment ? "Edit Comment" : "Add Comment"} placement="top">
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                p: 0.25,
                                                                opacity: 0.6,
                                                                transition: "0.2s",
                                                                "&:hover": { color: "error.info", opacity: 1 },
                                                            }}
                                                            onClick={() => onMoveAction?.(
                                                                move.coachComment ? "edit_comment" : "add_comment", 
                                                                { moveIndex: absIndex -1, moveNota: move.nota }
                                                            )}
                                                        >
                                                            {move.coachComment ? <EditNote fontSize="small" /> : <NoteAdd fontSize="small" />}
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Box>
                                        {isVisibleMove && showNotations && (move.comment || move.coachComment) && (
                                            <Box
                                                sx={{
                                                    gridColumn: "1 / span 3",
                                                    py: "0.1rem",
                                                    width: isExpanded ? "100%" : "25ch",
                                                    fontSize: "0.85rem",
                                                    fontFamily: "monospace",
                                                    color: "text.secondary",
                                                    whiteSpace: isExpanded ? "wrap" : "nowrap",
                                                    wordBreak: "break-word",
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        color: "action.active",
                                                    }
                                                }}
                                                onClick={() => setExpandedComments(prev => ({
                                                    ...prev,
                                                    [absIndex]: true
                                                }))}
                                            >
                                                <Typography variant="body2" sx={{ mb: 0.5, width: "100%", textOverflow: "ellipsis", overflow: "hidden" }}>
                                                    {move.comment && <>{move.comment.trim()}<br/></>}
                                                    <Typography variant="body2" color="primary" sx={{ mb: 0.5, width: "100%", textOverflow: "ellipsis", overflow: "hidden" }}>
                                                        {move.coachComment}
                                                    </Typography>
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default MovesTable;
