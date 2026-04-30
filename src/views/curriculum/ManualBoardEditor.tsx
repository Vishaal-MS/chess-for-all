import {useNotify} from "react-admin";
import {useMemo, useState} from "react";
import {BLACK, Chess, WHITE} from "chess.js";
import {
    Box, Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputLabel,
    MenuItem,
    Select,
    TextField, Tooltip
} from "@mui/material";
import {Chessboard, ChessboardDnDProvider, SparePiece} from "react-chessboard";
import {BoardBackground, DarkSquare, LightSquare, pieceImages} from "../../images/chess_board";

const getCastlingFromFen = (fen: string) => {
    const parts = fen.split(" ");
    return parts[2] !== '-' ? parts[2] : '';
}

const getEnPassantSquare = (fen: string) => {
    const parts = fen.trim().split(" ");
    return parts[3] !== '-' ? parts[3] : '';
}

const getHalAndFullMoves = (fen: string) => {
    const parts = fen.trim().split(" ");
    const halfMove = parseInt(parts[4]);
    const fullMove = parseInt(parts[5]);
    return {halfMove, fullMove}
}

const isValidEnPassantInput = (val: string) => {
    return (val === "-" || val === "" || /^[a-h]$/.test(val) || /^[a-h][36]$/.test(val));
}

const DEFAULT_HALF_AND_FULL_MOVES = {halfMove: 0, fullMove: 1};

export const ManualBoardEditor = ({onSetupBoard, initialPosition}: {
    onSetupBoard: (fen: string) => void,
    initialPosition: string
}) => {

    const notify = useNotify();
    const game = useMemo(() => new Chess(initialPosition, {skipValidation: true}), []);
    const [boardWidth, setBoardWidth] = useState(360);
    const [fenPosition, setFenPosition] = useState(game.fen());
    const [sideToStart, setSideToStart] = useState(game.turn());
    const [castlingRights, setCastlingRights] = useState(getCastlingFromFen(game.fen()));
    const [enPassantSquare, setEnPassantSquare] = useState(getEnPassantSquare(game.fen({forceEnpassantSquare: true})));
    const [halfAndFullMoves, setHalfAndFullMoves] = useState(getHalAndFullMoves(game.fen()));

    const isCastlingValid = (flag: string): boolean => {
        const board = game.board();
        const positions = {
            K: {king: [7, 4], rook: [7, 7], color: 'w'},
            Q: {king: [7, 4], rook: [7, 0], color: 'w'},
            k: {king: [0, 4], rook: [0, 7], color: 'b'},
            q: {king: [0, 4], rook: [0, 0], color: 'b'}
        };
        const config = positions[flag];
        if (!config) return false;
        const king = board[config.king[0]][config.king[1]];
        const rook = board[config.rook[0]][config.rook[1]];
        return (
            king?.type === 'k' && king.color === config.color &&
            rook?.type === 'r' && rook.color === config.color
        );
    };

    const updateStateFromGame = () => {
        const fen = game.fen();
        setFenPosition(fen);
        setCastlingRights(getCastlingFromFen(game.fen()));
    };

    const handleSparePieceDrop = (piece, targetSquare) => {
        const color = piece[0];
        const type = piece[1].toLowerCase();
        const success = game.put({type, color}, targetSquare);
        if (success) {
            updateStateFromGame();
        } else {
            notify(`The board already contains ${color === WHITE ? "WHITE" : "BLACK"} KING`, {type: "warning"});
        }
        return success;
    };

    const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
        const color = piece[0];
        const type = piece[1].toLowerCase();
        game.remove(sourceSquare);
        game.remove(targetSquare);
        const success = game.put({type, color}, targetSquare);
        if (success) {
            updateStateFromGame();
        }
        return success;
    };

    const handlePieceDropOffBoard = (sourceSquare) => {
        game.remove(sourceSquare);
        updateStateFromGame();
    };

    const handleResetBoard = () => {
        game.reset();
        updateStateFromGame();
        setSideToStart(WHITE);
        setEnPassantSquare("");
        setHalfAndFullMoves(DEFAULT_HALF_AND_FULL_MOVES);
    };

    const handleClearBoard = () => {
        game.clear();
        updateStateFromGame();
        setSideToStart(WHITE);
        setEnPassantSquare("");
        setHalfAndFullMoves(DEFAULT_HALF_AND_FULL_MOVES);
    };

    const handleStartByBoard = (e) => {
        setSideToStart(e.target.value);
    };

    const handleEnPassantChange = (e) => {
        const value = e.target.value.trim().toLowerCase();
        if (isValidEnPassantInput(value)) {
            setEnPassantSquare(value);
        }
    };

    const handleSetUpBoard = () => {
        const parts = fenPosition.trim().split(' ');
        const enPassant = /^[a-h][36]$/.test(enPassantSquare) ? enPassantSquare : "-";
        parts[1] = sideToStart;
        parts[2] = castlingRights || '-';
        parts[3] = enPassant;
        parts[4] = halfAndFullMoves.halfMove || "0";
        parts[5] = halfAndFullMoves.fullMove || "1";
        const updatedFen = parts.join(' ');
        onSetupBoard(updatedFen);
    };

    const handleCastling = (e, flag: string) => {
        const checked = e.target.checked;
        let rights = castlingRights;
        if (checked && !rights.includes(flag)) {
            rights += flag;
        }
        if (!checked) {
            rights = rights.replace(flag, '');
        }
        rights = rights.split('').sort().join('') || '-';
        const parts = fenPosition.split(' ');
        parts[2] = rights;
        const newFen = parts.join(' ');
        game.load(newFen, {skipValidation: true});
        setFenPosition(newFen);
        setCastlingRights(rights);
    };

    const handleHalfAndFullMoveChange = (e) => {
        const {name, value} = e.target;
        if (value.length <= 2) {
            const validVal = value.replace(/\D/g, '');
            setHalfAndFullMoves(prev => ({
                ...prev,
                [name]: parseInt(validVal)
            }));
        }
    };

    const pieces = ["wP", "wN", "wB", "wR", "wQ", "wK", "bP", "bN", "bB", "bR", "bQ", "bK"];

    const customPieces = useMemo(() => {
        const pieceComponents = {} as any;
        pieces.forEach(piece => {
            pieceComponents[piece] = ({squareWidth}) => <PieceImageField piece={piece} squareWidth={squareWidth}/>
        });
        return pieceComponents;
    }, []);

    return (
        <Box sx={{mt: 0.5}}>
            {/*Chess Board With Spare Pieces*/}
            <ChessboardDnDProvider>
                <Box sx={{
                    px: 1, py: 0.1, margin: "0 auto", maxWidth: "50vh",
                    borderRadius: "0.2rem", backgroundImage: `url(${BoardBackground})`
                }}>
                    <SparePieces pieces={pieces.slice(6, 12)} boardWidth={boardWidth} dndId={"ManualBoardEditor"}/>
                    <Chessboard
                        onBoardWidthChange={setBoardWidth}
                        id="ManualBoardEditor"
                        position={game.fen()}
                        onSparePieceDrop={handleSparePieceDrop}
                        onPieceDrop={handlePieceDrop}
                        onPieceDropOffBoard={handlePieceDropOffBoard}
                        dropOffBoardAction="trash"
                        customDarkSquareStyle={{backgroundImage: `url(${DarkSquare})`}}
                        customLightSquareStyle={{backgroundImage: `url(${LightSquare})`}}
                        customNotationStyle={{color: "black"}}
                        customDropSquareStyle={{boxShadow: 'inset 0 0 0.2rem 0.1rem green'}}
                        customPieces={customPieces}
                    />
                    <SparePieces pieces={pieces.slice(0, 6)} boardWidth={boardWidth} dndId={"ManualBoardEditor"}/>
                </Box>
            </ChessboardDnDProvider>

            {/* Controls */}
            <Box sx={{mb: 0.5}} display="flex" justifyContent="center" alignItems="center" flexWrap="wrap">
                <FormLabel sx={{paddingInlineEnd: 2}}>Castling:</FormLabel>
                {['K', 'Q', 'k', 'q'].map(flag => (
                    <FormControlLabel
                        key={flag}
                        control={
                            <Checkbox
                                size="small"
                                sx={{p: 1}}
                                checked={castlingRights.includes(flag)}
                                onChange={(e) => handleCastling(e, flag)}
                                disabled={!isCastlingValid(flag)}
                            />
                        }
                        label={flag}
                    />
                ))}
                <TextField
                    label="En Passant" value={enPassantSquare} placeholder="-"
                    onChange={handleEnPassantChange}
                    inputProps={{maxLength: 2, style: {textTransform: 'lowercase'}}}
                    sx={{...TextFieldCss}}
                />
                <FormControl sx={{paddingInlineStart: 1, width: 100}}>
                    <InputLabel id="side-to-start-label">Start By</InputLabel>
                    <Select sx={{
                        height: 32,
                        fontSize: "0.75rem",
                        paddingInlineEnd: "1rem",
                    }}
                            labelId="side-to-start-label"
                            value={sideToStart}
                            label="Start By"
                            onChange={handleStartByBoard}
                    >
                        <MenuItem value={WHITE}>White</MenuItem>
                        <MenuItem value={BLACK}>Black</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box display="flex" flexWrap={"wrap"} columnGap={1} justifyContent="center" alignItems="center">
                <TextField
                    label="Half Move" name={"halfMove"} type={"number"} placeholder="0"
                    value={halfAndFullMoves.halfMove}
                    onChange={handleHalfAndFullMoveChange}
                    sx={{...TextFieldCss}}
                />
                <TextField
                    label="Full Move" name={"fullMove"} type={"number"} placeholder="1"
                    value={halfAndFullMoves.fullMove}
                    onChange={handleHalfAndFullMoveChange}
                    sx={{...TextFieldCss}}
                />
                <Tooltip title={"Reset Board"}>
                    <Button variant={"contained"} sx={{py: 0}} size={"small"} onClick={handleResetBoard}>
                        Reset
                    </Button>
                </Tooltip>
                <Tooltip title={"Clear Board"}>
                    <Button variant="contained" sx={{py: 0}} size="small" onClick={handleClearBoard}>
                        Clear
                    </Button>
                </Tooltip>
                <Tooltip title={"Setup Board"}>
                    <Button variant="contained" sx={{py: 0}} size="small" onClick={handleSetUpBoard}>
                        Setup Board
                    </Button>
                </Tooltip>
            </Box>
        </Box>
    );
};

const PieceImageField = ({piece, squareWidth}) => {
    return (
        <Box
            style={{
                width: squareWidth,
                height: squareWidth,
                backgroundImage: `url(${pieceImages[piece]})`,
                backgroundSize: "100%",
            }}
        />
    );
};

const SparePieces = ({pieces, dndId, boardWidth}) => {
    return (
        <Box sx={{backgroundImage: `url(${LightSquare})`, borderRadius: 0.5}}
             style={{display: "flex", margin: `0.2rem ${boardWidth / 8}px`}}>
            {pieces.map(piece => (
                <SparePiece
                    key={piece}
                    piece={piece}
                    width={boardWidth / 8}
                    customPieceJSX={({squareWidth}) => (
                        <PieceImageField piece={piece} squareWidth={squareWidth}/>
                    )}
                    dndId={dndId}
                />
            ))}
        </Box>
    );
};

const TextFieldCss = {
    '& .MuiInputBase-input': {
        fontSize: '0.75rem',
        paddingTop: '0.75rem',
        height: '1rem'
    },
    '& .MuiInputLabel-root': {
        fontSize: '0.75rem'
    },
    width: 100
};
