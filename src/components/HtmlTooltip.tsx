import {styled} from "@mui/material/styles";
import {Tooltip, tooltipClasses, TooltipProps} from "@mui/material";

interface CustomTooltipProps extends TooltipProps {
    customStyle?: Record<string, any>;
}

export const HtmlTooltip = styled(({customStyle, className, ...props}: CustomTooltipProps) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme, customStyle}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
        ...(customStyle || {})
    },
}));