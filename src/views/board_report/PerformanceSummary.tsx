import {Box, Card, Grid, Stack, Typography} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import React, {ReactNode} from "react";
import { formatWithComma } from "../../utils";
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { PerformanceDateRange } from "../../helpers/constants";
import { GameIcon } from "../games/GameIcon";


export const PerformanceSummary = ({boardUpdates, state}) => {
    const totalAssignedBlockPercentage = boardUpdates.growthRate.totalAssignedBlockPercentage || 0
    const totalAssignmentPercentage = boardUpdates.growthRate.totalAssignmentPercentage || 0;
    const totalCompletedStudentPercentage = boardUpdates.growthRate.totalCompletedStudentPercentage || 0;
    const isMacro = boardUpdates?.isMacro;
    const completedStudentCount = boardUpdates?.totalCompletedStudentCount || 0;
    const studentCount = isMacro ? completedStudentCount : Math.round(boardUpdates?.totalAssignedStudentCount - completedStudentCount);
    const studentsPercentage = Math.round((completedStudentCount / boardUpdates?.totalAssignedStudentCount) * 100) || 0;
    const percentage = isMacro ? studentsPercentage : Math.round(100 - studentsPercentage) || 0;
    const isActiveStudentNoChange = boardUpdates.growthRate.isActiveStudentNoChange;
    const isActivitiesNoChange = boardUpdates.growthRate.isActivitiesNoChange;
    const isAssignmentNoChange = boardUpdates.growthRate.isAssignmentNoChange;
    const isCompare = state.isCompare;
    const StudentIcon = isMacro ? <GroupAddIcon fontSize="small" color={"action"}/> : <GroupRemoveIcon fontSize="small" color={"action"}/>;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
                <PerformanceCard title={`${isMacro ? 'Passed' : 'Missed'} Students`} icon={StudentIcon}
                                 value={studentCount} subtext={`/ ${boardUpdates?.totalAssignedStudentCount}`}
                                 chip={<>{totalCompletedStudentPercentage}%</>}
                                 growthPercent={totalCompletedStudentPercentage} studentPercentage={percentage} isNoChange={isActiveStudentNoChange} isCompare={isCompare} period={state.dateRange}/>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <PerformanceCard title={"Activities"} icon={<GameIcon fontSize="small" color={"action"}/>}
                                 value={boardUpdates?.totalAssignedBlockCounts}
                                 chip={<>{totalAssignedBlockPercentage}%</>}
                                 growthPercent={totalAssignedBlockPercentage} isNoChange={isActivitiesNoChange} isCompare={isCompare} period={state.dateRange}/>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <PerformanceCard title={"Assignments"}
                                 icon={<AssignmentTurnedInIcon fontSize="small" color={"action"}/>} value={boardUpdates?.totalAssignmentCounts}
                                 chip={<>{totalAssignmentPercentage}%</>}
                                 growthPercent={totalAssignmentPercentage} isNoChange={isAssignmentNoChange} isCompare={isCompare} period={state.dateRange}/>
            </Grid>
        </Grid>
    )
}

const PerformanceCard = ({title, value, icon, subtext, chip, growthPercent, studentPercentage, isNoChange, isCompare, period}: {
    title: string,
    value: string,
    icon: ReactNode,
    subtext?: any,
    chip: any,
    chipColor?: any,
    growthPercent?: any,
    studentPercentage?: any,
    isNoChange?: boolean,
    isCompare?: boolean,
    period?: string
}) => {
    const isUp = growthPercent > 0;
    const isZeroPercent = growthPercent === 0;
    const ArrowIcon = isUp ? ArrowUpwardIcon : ArrowDownwardIcon;
    const periodRange = React.useRef(period);

    if (!isNoChange && isZeroPercent && isCompare) {
        chip = <Typography variant={"caption"}>No Data{periodRange.current && ` in ${PerformanceDateRange()[periodRange.current]}`}</Typography>;
    }
    return (
        <Card sx={{
            padding: 2,
            borderRadius: "0.8rem",
            border: (theme) => theme.palette.mode === 'dark' ? '0.063rem solid #333' : '0.063rem solid #e2e8f0',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#423d3d' : 'white',
            boxShadow: '0 0.063rem 0.188rem rgba(0,0,0,0.02), 0 0.063rem 0.125rem rgba(0,0,0,0.04)'
        }}>
            <Stack direction={"row"} spacing={1} mb={1} alignItems={"center"}>
                {icon}
                <Typography color="text.secondary">
                    {title}
                </Typography>
            </Stack>
            <Typography variant="h4" fontWeight="bold">
                {formatWithComma(value)}
                {subtext && (
                    <>
                        <Typography component={"span"} variant="h6" fontWeight="bold" color="text.secondary" ml={1}>
                            {subtext}
                        </Typography>
                        <Typography component={"span"} variant='subtitle1' fontWeight="bold" color='success' ml={1}>
                            ({studentPercentage}%)
                        </Typography>
                    </>
                )}
            </Typography>
            {chip && isCompare &&
                <Box sx={{
                    backgroundColor: theme => isZeroPercent ? theme.palette.background.default :isUp ?'#f0fdf4': '#fef2f2',
                    display: 'inline-block',
                    borderRadius: '62.438rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: theme => isZeroPercent ? theme.palette.text.secondary : isUp ? '#10b981' : '#ef4444',
                }}>
                    {(!isZeroPercent && !isNoChange) &&
                        <ArrowIcon sx={{verticalAlign: 'middle', fontSize: '1rem', marginRight: '0.188rem'}}/>}
                    {chip}
                </Box>}
        </Card>
    )
}