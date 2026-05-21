import {Box, Card, Grid, Tooltip, Typography} from "@mui/material";
import {HtmlTooltip} from "../../components/HtmlTooltip.tsx";

export const ProgressBarChart = ({boardUpdates}) => {
    return (
        <Grid container sx={{mt:2}}>
            <Grid item xs={12} md={12} sx={{paddingTop: '0 !important'}}>
                <BarChartCard title={"Cognitive Skills Practiced"} data={boardUpdates.skillReport} dataKey={"skill"} valueKey={"value"}/>
            </Grid>
        </Grid>
    )
}

const BarChartCard = ({title, data, dataKey, valueKey}) => {
    return (
        <Card sx={{
            p:2,
            paddingRight: '0.2rem',
            maxHeight: '15.3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            borderRadius: "0.8rem",
            overflowY: 'auto',
            scrollbarWidth: 'none',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#423d3d' : 'white',
        }}>
            <Typography variant={"subtitle2"} fontWeight={500} color={"text.secondary"} mb={0.8}>
                {title}
            </Typography>
            {data.length === 0 && (
                <Box sx={{alignItems: 'center', width: '100%', textAlign: 'center', py: 4}}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        No data available.
                    </Typography>
                </Box>)}
            <Grid container>
                {data.sort((a, b) => b.total - a.total).map((item, index) => (
                    <Grid key={index} item md={data.length > 4 ? 6 : 12} sx={{display: 'flex', alignItems: 'center', mb: 0.9, mt: 0.9, px: 2}}>
                        <Tooltip title={item.label}>
                            <Box sx={{
                                width: "35%",
                                color: (theme) => theme.palette.mode === 'dark' ? "white" : "#5a677d",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {item.label}
                            </Box>
                        </Tooltip>
                        <HtmlTooltip title={<Typography variant={"subtitle2"}> {item.value}/{item.total}</Typography>}
                                    followCursor
                        >
                            <Box sx={{
                                flexGrow: "1",
                                backgroundColor: '#e2e8f0',
                                borderRadius: '0.25rem',
                                height: '1.6rem',
                                padding: '0.156rem',
                            }}>
                                <Box sx={{
                                    width: `${(item.value / item.total) * 100}%`,
                                    backgroundColor: `${item.value > 0 ? '#2563eb' : '#e2e8f0'}`,
                                    height: '100%',
                                    borderRadius: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '0.75rem',
                                }} />
                            </Box>
                        </HtmlTooltip>
                        <Box sx={{pl: 1, minWidth:"2rem"}}>{Math.round((item.value / item.total) * 100)}%</Box>
                    </Grid>
                ))}
            </Grid>
        </Card>
    )
}