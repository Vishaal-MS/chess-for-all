import FlashOnIcon from '@mui/icons-material/FlashOn';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TimerIcon from '@mui/icons-material/Timer';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { Box, Typography } from '@mui/material';

export const getTimeControlIcon = (name: string) => {
    const lower = name?.toLowerCase() || "";

    if (lower.includes("bullet")) return WhatshotIcon;
    if (lower.includes("blitz")) return FlashOnIcon;
    if (lower.includes("rapid")) return TimerIcon;
    if (lower.includes("classical")) return HourglassBottomIcon;

    return TimerIcon; // default
};

export const getTimeControlText = (timeControl: any): string => {
    if (!timeControl) {
        return "";
    }
    const { name, base_time_number = 0, increment_time_number = 0 } = timeControl;
    const minutes = Math.floor(base_time_number / 60);
    const increment = increment_time_number;

    const baseLabel = minutes > 0 ? minutes.toString() : base_time_number.toString();
    const incrementLabel = `+${increment}`;
    return `${name} (${baseLabel}${incrementLabel})`;
};

export const getTimeControlLabel = (timeControl: any) => {
    if (!timeControl) {
        return "";
    }
    const Icon = getTimeControlIcon(timeControl.name);
    const label = getTimeControlText(timeControl);
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Icon fontSize="small" />
            <Typography variant="body2">{label}</Typography>
        </Box>
    );
};
