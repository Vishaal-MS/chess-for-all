import { ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    Typography
} from '@mui/material';
import { ReactNode } from 'react';

interface AccordionSectionProps {
    title: ReactNode;
    children: ReactNode;
    defaultExpanded?: boolean;
    showCount?: boolean;
    sx?: object;
    color?: string;
    count?: ReactNode;
    contentMinHeight?: number | string | null;
    contentMaxHeight?: number | string | null;
    contentHeight?: number | string | null;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    expanded?: boolean;
}

const AccordionSection = ({
    title,
    children,
    defaultExpanded = false,
    showCount = true,
    sx = {},
    color = "#1976d2",
    count,
    contentMinHeight = null,
    contentMaxHeight = null,
    contentHeight = null,
    onClick,
    expanded
}: AccordionSectionProps) => {
    return (
        <Accordion
            expanded={expanded}
            defaultExpanded={defaultExpanded}
            disableGutters
            sx={{
                mb: 2,
                borderRadius: 1,
                overflow: 'auto',
                ...sx,
            }}
        >
            <AccordionSummary
                onClick={onClick}
                expandIcon={<ExpandMore sx={{ p: 0, color: (theme) => theme.palette.common.white }} />}
                sx={{
                    backgroundColor: color,
                    color: (theme) => theme.palette.common.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    "&.Mui-expanded, &:not(.Mui-expanded)": {
                        minHeight: "36px !important",
                    },
                }}
                slotProps={{
                    content: {
                        sx: {
                            margin: "2px !important",
                        },
                    },
                }}
            >
                <Box display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                >
                    <Typography variant="body1" fontWeight={500}>
                        {title}
                    </Typography>
                    {showCount && count !== undefined && (
                        <Chip
                            sx={{
                                color: (theme) => theme.palette.common.white,
                                bgcolor: (theme) =>
                                    theme.palette.mode === "dark"
                                        ? "rgba(55, 55, 55, 0.3)"
                                        : "rgba(255, 255, 255, 0.3)",
                                fontWeight: "bold",
                                fontSize: 14
                            }}
                            label={count}
                            size="small"
                        />
                    )}
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ scrollbarWidth: 'none', overflow: 'auto',height: contentHeight, minHeight: contentMinHeight, maxHeight: contentMaxHeight,px: 1, py: 1 }}>
                <Box>{children}</Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default AccordionSection;
