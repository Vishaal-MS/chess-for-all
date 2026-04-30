import React from "react";
import { NumberFieldProps, sanitizeFieldRestProps, useFieldValue } from "react-admin";
import { Typography } from "@mui/material";

/**
 * A custom field for React Admin to display durations in HH:mm:ss or mm:ss format.
 * Supports input format in seconds.
 */
const TimeField: React.FC<NumberFieldProps> = (props) => {
    const { source, className, ...rest } = props;
    const value = useFieldValue(props);
    if (!value || value == null || !(value > 0)) return false;

    const timeInSec = value;

    const hours = Math.floor(timeInSec / 3600);
    const minutes = Math.floor((timeInSec % 3600) / 60);
    const seconds = timeInSec % 60;

    const formatted = [
        minutes.toString().padStart(2, "0"),
        seconds.toString().padStart(2, "0"),
    ];
    if (hours > 0) {
        formatted.unshift(hours.toString().padStart(2, "0"))
    }

    return (
        <Typography 
            component="span" 
            variant="body2" 
            className={className} 
            {...sanitizeFieldRestProps(rest)}
        >
            {formatted.join(":")}
        </Typography>
    );
};

export default TimeField;
