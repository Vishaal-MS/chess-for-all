import { Link } from "@mui/icons-material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarViewDayIcon from '@mui/icons-material/CalendarViewDay';
import {
    Box,
    Card,
    Chip,
    Divider,
    Grid, Stack,
    Typography
} from "@mui/material";
import {
    DateField,
    Loading,
    ReferenceField,
    useGetManyReference,
    useRecordContext
} from "react-admin";
import {camelCaseToLabel, formatDateWithShortYear, getFormattedTime} from "../../utils";
import { Empty } from "../common/empty";
import {ScheduleTypes} from "../../helpers/constants.ts";

const SchedulePreview = () => {
    const record = useRecordContext();
    const { data, isLoading, error } = useGetManyReference('class_schedules', {
        target: 'class_id',
        id: record?.id,
        meta: {prefetch: ['schedule_types']},
        pagination: { page: 1, perPage: 1 },
        sort: { field: 'start_date', order: 'ASC' },
    });

    if (isLoading) return <Loading />;

    if (error || !data?.length) return (
        <Grid container sx={{ height: 150 }}>
            <Empty showIcon={false} emptyText="Schedule not created yet" />
        </Grid>
    )

    const schedule = data[0];

    return (

        <Grid container sx={{ maxHeight: 160, overflow: "auto", scrollbarWidth: "none" }} spacing={1}>

            <Grid item xs={12} sm={12}>
                <Box display="flex" alignItems="center" gap={0.5} width="100%">
                    <CalendarTodayIcon fontSize="small" color="action"/>&nbsp;
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2">
                            {/*<DateField source="start_date"*/}
                            {/*           record={schedule}*/}
                            {/*           sx={{paddingLeft: 0}}*/}
                            {/*           options={{year: '2-digit', month: '2-digit', day: '2-digit'}}*/}
                            {/*/>*/}
                            {formatDateWithShortYear(schedule.start_date)}
                        </Typography>
                        <Typography variant="body2"
                                    sx={{fontWeight: "bold", color: "gray", marginLeft: "4px", marginRight: "4px"}}
                        >TO</Typography>
                        <Typography variant="body2">
                            {/*<DateField source="end_date"*/}
                            {/*           record={schedule}*/}
                            {/*           sx={{paddingLeft: 0}}*/}
                            {/*           options={{year: '2-digit', month: '2-digit', day: '2-digit'}}*/}
                            {/*/>*/}
                            {formatDateWithShortYear(schedule.end_date)}
                        </Typography>
                    </Box>
                </Box>
            </Grid>

            <Grid item xs={12} sm={12}>
                <Box display="flex" alignItems="center" gap={0.5} width="100%">
                    <AccessTimeIcon fontSize="small" color="action"/>&nbsp;
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2">{getFormattedTime(schedule.start_datetime)}</Typography>
                        <Typography variant="body2"
                            sx={{fontWeight: "bold", color: "gray", marginLeft: "4px", marginRight: "4px"}}
                        >TO</Typography>
                        <Typography variant="body2">{getFormattedTime(schedule.end_datetime)}</Typography>
                    </Box>
                </Box>
            </Grid>

            <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2" sx={{display: "flex"}}>
                        <Stack direction={"row"} spacing={1}>
                            <CalendarViewDayIcon fontSize="small" color="action"/>
                            {schedule?.schedule_type?.name === ScheduleTypes.DAILY && (
                                <Chip label={"Daily"} size="small"
                                      sx={{backgroundColor: 'LightSlateGrey', color: '#fff'}}/>
                            )}
                            {schedule?.schedule_type?.name === ScheduleTypes.ONCE && (
                                <Chip label={"Once"} size="small"
                                      sx={{backgroundColor: 'LightSlateGrey', color: '#fff'}}/>
                            )}
                            {schedule.days && (
                                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                    {(Array.isArray(schedule.days) ? schedule.days : typeof schedule.days === "string" ? schedule.days.split(',') : []
                                    ).map((day: any, index: any) => (
                                        <Chip key={index} label={camelCaseToLabel(day.trim()).substring(0,3)} size="small"
                                              sx={{backgroundColor: 'LightSlateGrey', color: '#fff'}}/>
                                    ))}
                                </Box>)}
                        </Stack>
                    </Typography>
                </Box>
            </Grid>

            {schedule.calendar_links && (
                <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Link fontSize="small" color="action" />
                        <Typography variant="body2">
                            <strong>Links:</strong> {schedule.calendar_links}
                        </Typography>
                    </Box>
                </Grid>
            )}

            {schedule.details && (
                <Grid item xs={12}>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        <strong>Details:</strong>  {schedule.details}
                    </Typography>
                </Grid>
            )}
        </Grid>
    );
};

export default SchedulePreview;

