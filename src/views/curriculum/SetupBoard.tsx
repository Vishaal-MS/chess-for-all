import {
    Dialog,
    DialogContent,
    DialogTitle,
    Fab,
    IconButton,
    Tooltip
} from "@mui/material";
import {Dataset} from "@mui/icons-material";
import React, {useState} from 'react';
import CloseIcon from "@mui/icons-material/Close";
import {ManualBoardEditor} from "./ManualBoardEditor.tsx";

const STARTING_POSITION_REGEX = /starting position\s*[:\-]?\s*(.+)/i;
const FEN_PIECES_REGEX = /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+/;
const FEN_PIECES_WITH_TURN_REGEX = /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s+[wb]/;
const DEFAULT_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

function extractStartingPositionLine(value: string): { line: string, notation: string } | null {
    const lines = value.split('\n');
    for (const line of lines) {
        const match = line.match(STARTING_POSITION_REGEX);
        if (match) {
            return {line, notation: match[1].trim()};
        }
    }
    return null;
}

function isFen(notation: string): boolean {
    return FEN_PIECES_REGEX.test(notation);
}

function hasTurn(notation: string): boolean {
    return FEN_PIECES_WITH_TURN_REGEX.test(notation);
}

function getUserCommentFenPosition(value: string): string {
    const result = extractStartingPositionLine(value);
    if (result) {
        let notation = isFen(result.notation)
            ? result.notation
            : customNotationToFen(result.notation);

        if (FEN_PIECES_REGEX.test(notation) && !hasTurn(notation)) {
            const parts = notation.split(' ');
            parts[0] += " w"
            notation = parts.join(' ');
        }
        return notation;
    }
    return DEFAULT_FEN;
}

function handleSetupBoardUpdate(
    input: HTMLTextAreaElement | null,
    inputValue: string,
    fenPosition: string,
    setInputValue: (val: string) => void,
    setOpen: (open: boolean) => void
) {
    if (!input) return;

    const result = extractStartingPositionLine(inputValue);
    const fenLine = `Starting Position - ${fenPosition}`;
    let newValue: string;

    if (result) {
        const lines = inputValue.split('\n');
        const matchIndex = lines.findIndex(line => line === result.line);
        if (matchIndex !== -1) {
            lines[matchIndex] = fenLine;
            newValue = lines.join('\n');
        } else {
            newValue = inputValue;
        }
    } else {
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const before = inputValue.slice(0, start);
        const after = inputValue.slice(end);
        newValue = before + fenLine + '\n' + after;
    }

    setInputValue(newValue);

    setTimeout(() => {
        input.focus();
        const newCursorPos = newValue.indexOf(fenLine) + fenLine.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    setOpen(false);
}

function customNotationToFen(input: string): string {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const files = "abcdefgh";

    function place(pieces: string, color: 'w' | 'b') {
        if (!pieces) return;
        pieces.split(',').forEach(piece => {
            const match = piece.match(/([KQRBNP])([a-h][1-8])/i);
            if (!match) return;
            const type = match[1];
            const square = match[2];
            const file = files.indexOf(square[0]);
            const rank = 8 - parseInt(square[1]);
            board[rank][file] = (color === 'w' ? type.toUpperCase() : type.toLowerCase());
        });
    }

    const [whitePart, blackPart] = input.split('/');
    place(whitePart?.replace(/^w/, ''), 'w');
    place(blackPart?.replace(/^b/, ''), 'b');

    return board.map(row => {
        let str = '';
        let empty = 0;
        for (const cell of row) {
            if (!cell) {
                empty++;
            } else {
                if (empty > 0) {
                    str += empty;
                    empty = 0;
                }
                str += cell;
            }
        }
        if (empty > 0) str += empty;
        return str;
    }).join('/') + ' w - - 0 1';
}

export const SetupBoard = ({inputRef, inputValue, setInputValue}) => {
    const [open, setOpen] = useState(false);
    const initialPosition = getUserCommentFenPosition(inputValue.trim());

    const handleClick = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSetupBoard = (fenPosition: string) => {
        handleSetupBoardUpdate(inputRef.current, inputValue, fenPosition, setInputValue, setOpen);
    }

    return (
        <>
            <Tooltip title="Setup Board" placement="auto">
                <Fab variant="extended" size="small" color="primary" onClick={handleClick} sx={{mt: 1}}>
                    <Dataset/>
                </Fab>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{m: 0, px: 2, py: 1, position: 'relative', textAlign: 'center', fontSize: '1.25rem'}}>
                    Setup Board
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute', right: 3, top: 3,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{padding: 1, pt: 0}}>
                    <ManualBoardEditor onSetupBoard={handleSetupBoard} initialPosition={initialPosition}/>
                </DialogContent>
            </Dialog>
        </>
    );
};
