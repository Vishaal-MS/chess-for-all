// create a game end modal with result and show won, lose, draw result of game
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { SentimentDissatisfied } from "@mui/icons-material";
import { GameEndResult } from "../../helpers/constants";

interface GameEndModalProps {
    open: boolean;
    onClose: () => void;
    result: string | null;
    reason?: string | null;
}

export const GameEndModal: React.FC<GameEndModalProps> = ({
    open,
    onClose,
    result,
    reason
}) => {
    let title = "";
    let icon = null;
    let message = "";

    switch (result) {
        case GameEndResult.WON:
            title = "You Won!";
            icon = <EmojiEventsIcon sx={{ fontSize: 60, color: "gold" }} />;
            message = "Congratulations! You played a great game.";
            break;
        case GameEndResult.WHITE_WON:
            title = "White Won!";
            icon = <EmojiEventsIcon sx={{ fontSize: 60, color: "gold" }} />;
            message = "White played a great game.";
            break;
        case GameEndResult.BLACK_WON:
            title = "Black Won!";
            icon = <EmojiEventsIcon sx={{ fontSize: 60, color: "gold" }} />;
            message = "Black played a great game.";
            break;
        case GameEndResult.LOSE:
            title = "You couldn't win this time!";
            icon = (
                <SentimentDissatisfied
                    sx={{ fontSize: 60, color: "orange" }}
                />
            );
            message = "Better luck next time. Keep practicing!";
            break;
        case GameEndResult.Withdrawn:
            title = "Game withdrawn!";
            icon = <EmojiEventsIcon sx={{ fontSize: 60, color: "gray" }} />;
            message = "The game has been withdrawn.";
            break;
        case GameEndResult.DRAW:
            title = "It's a Draw!";
            icon = <SportsScoreIcon sx={{ fontSize: 60, color: "gray" }} />;
            message = "A well-fought game by both sides.";
            break;
        default:
            title = "Game Over";
            icon = null;
            message = "The game has concluded.";
            break;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
                {title}
            </DialogTitle>
            <DialogContent sx={{ textAlign: "center" }}>
                {icon}
                {reason && (
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                        {reason}
                    </Typography>
                )}
                <Typography variant="h6" sx={{ mt: reason ? 1 : 2 }}>
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}></DialogActions>
            <Button onClick={onClose} color="primary" variant="contained">
                Close
            </Button>
        </Dialog>
    );
};