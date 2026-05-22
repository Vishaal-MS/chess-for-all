import { useEffect, useState } from 'react';
import { Box, MenuItem, Select, Stack, Typography, OutlinedInput, Tooltip, Menu, Card, Grid } from "@mui/material";
import DateRangeIcon from "@mui/icons-material/DateRange";
import GradeOutlinedIcon from "@mui/icons-material/GradeOutlined";
import { Button, useTheme } from "react-admin";
import CircularProgress from "@mui/material/CircularProgress";
import {isIndianTenant, isRegularSchoolFlavored } from "../../backend/common_logics.ts";
import TextField from '@mui/material/TextField';
import { format } from "date-fns";
import { PerformanceDateRange, ReportViewModes } from "../../helpers/constants.ts";
import { getDateRange, sortGrades } from '../../utils.ts';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { IconButton } from "@mui/material";
import TuneIcon from '@mui/icons-material/Tune';
import { KeyboardReturn } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReport } from './ReportContext.tsx';

const selectStyle = {height: '2.188rem', width: '10.625rem', backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#423d3d' : 'white'}

const SELECT_CLIENT = 'Select Client';
const SELECT_RANGE = 'Select Range';
const ALL_GRADES = 'All Grades';
const isIndia = isIndianTenant();
export const rangeMap = {
    today: { type: "today" },
    last_school_year: isIndia ? { type: "school_year", startMonth: 3, endMonth: 2 } // Apr - Mar
                              : { type: "school_year", startMonth: 7, endMonth: 6}, // Aug - Jun
    last_fall_semester: { type: "semester", startMonth: 7, endMonth: 11 }, // Aug - Dec
    last_spring_semester: { type: "semester", startMonth: 0, endMonth: 5 }, // Jan - Jun

    current_school_year: isIndia ? { type: "school_year", startMonth: 3, endMonth: 2, current: true }
                                 : { type: "school_year", startMonth: 7, endMonth: 4, current: true },
    current_fall_semester: { type: "semester", startMonth: 7, endMonth: 11, current: true },
    current_spring_semester: { type: "semester", startMonth: 0, endMonth: 5, current: true },
    //India 
    last_year_term_1: {type: "semester", startMonth: 3, endMonth: 8}, // Apr - Sep
    last_year_term_2: {type: "semester", startMonth: 9, endMonth: 2}, // Oct - Mar
    current_year_term_1: {type: "semester", startMonth: 3, endMonth: 8, current: true},
    current_year_term_2: {type: "semester", startMonth: 9, endMonth: 2, current: true}
};


export const BoardHeader = ({state, setState, togglePassFail, toggleCompare, locationState, boardUpdates}) => {
    const dataProvider = window.swanAppFunctions.dataProvider;
    const DATE_RANGE = PerformanceDateRange();
    const [theme] = useTheme();
    const isCompare = state.isCompare;
    const locationRefData = locationState.current;
    const [isMacro, setIsMacro] = useState(locationRefData?.gradeId ? false : true);
    const { toggleShowBack } = useReport();

    useEffect(() => {
        const fetchClients = async () => {
            setState((prevState: any) => ({...prevState, loading: {isClientOptionsLoading: true}}));
            try {
                const {data: clients} = await dataProvider.getList('clients', {
                    sort: {field: 'name', order: 'ASC'},
                    meta: {prefetch: ['standards']},
                    filter: {client_type_id: 1, standard_id_neq: null} // 1 = 'Business' client_type
                });
                if (isRegularSchoolFlavored() && clients.length > 0) {
                   setState((prevState: any) => ({...prevState, clientValue: clients[0]?.id || SELECT_CLIENT}));
                }

                setState((prevState) => ({...prevState, clientOptions: clients, loading: { isClientOptionsLoading: false }}));
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };

        fetchClients();
        if (locationRefData && locationRefData.previousState) {
            toggleShowBack(true, locationRefData.previousState);
        }
    }, [locationRefData]);

    useEffect(() => {
        const fetchGradesByStandard = async () => {
            try {
                setState((prevState: any) => ({...prevState, loading: {isGradeOptionsLoading: true}}));
                const standardId = state.clientOptions.find(client => client.id === state.clientValue)?.standard_id || null;
                if (standardId) {
                    const {data: grades} = await dataProvider.getList('standard_grades', {
                        filter: {standard_id: standardId, standard_id_neq: null},
                        sort: {field: 'name', order: 'ASC'},
                    });
                    setState((prevState: any) => ({...prevState, gradeOptions: grades, loading: {isGradeOptionsLoading: false}}));
                    if (locationRefData?.gradeId) {
                        setState((prevState) => ({...prevState, isRun: true}));
                    }
                }
            } catch (error) {
                console.error("Error fetching grades:", error);
            }
        }
        if (state.clientValue && state.clientValue !== SELECT_CLIENT) {
            fetchGradesByStandard();
        }
    }, [state.clientValue, state.clientOptions]);

    useEffect(() => {
        handleDateRangeChange();
    }, [locationRefData, state.dateRange]);

    const handleDateRangeChange = (value?:any, index?: string) => {
        const dateRange = state?.[`dateRange${index || ''}`]
        let selectedRange = rangeMap[value ? value: dateRange];
        if (locationRefData?.dateRange) {
            selectedRange = rangeMap[locationRefData?.dateRange];
        }
        if(!selectedRange) return;
        const rangeConfig = selectedRange;
        const { from, to } = getDateRange(rangeConfig)
        setState((prev: any) => ({
            ...prev,
            minDate: from,
            [`fromDate${index}`]: from,
            [`to_date${index}`]: to
        }));
    }

    const renderDateRangeFilters = (index: string = "") => {
        let selectedDateRange = state[`dateRange${index}`];
        const isCustomPeriod = selectedDateRange == "custom_range";
        let dateRanges = Object.entries(DATE_RANGE);
        return (
            <Box alignItems={"center"} display={"flex"} sx={theme => ({
                [theme.breakpoints.up("lg")]: {
                    flexWrap: "nowrap",
                    width: "auto"
                },
                [theme.breakpoints.between("xs", "md")]: {
                    flexWrap: "wrap",
                    width: "100%"
                },
                gap: 1
            })}>
                <Select value={selectedDateRange}
                        sx={theme => ({
                            ...selectStyle, 
                            width: isCustomPeriod ? '10.625rem' :'100%', 
                            [theme.breakpoints.between("xs", "md")]: {
                                width: "100%"
                            }, 
                            '& .MuiSelect-select': {padding: '0.625rem 0.313rem'}
                        })}
                        onChange={(e) => {
                            const value = e.target.value;
                            setState((prevState: any) => ({...prevState, [`dateRange${index}`]: value}))
                            handleDateRangeChange(value, index)
                        }}
                        renderValue={(selected) => (
                            <Box sx={{display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                <DateRangeIcon color={'action'} sx={{paddingRight: '0.125rem'}}/>
                                {selectedDateRange === SELECT_RANGE ?
                                    <Typography color={"gray"}>{selected}</Typography> : DATE_RANGE[selected]}
                            </Box>
                        )}
                >
                    <MenuItem value={SELECT_RANGE} sx={{display: "none"}} disabled>{SELECT_RANGE}</MenuItem>
                    {dateRanges.map(([key, value]) => (
                        <MenuItem key={key} value={key}>{value}</MenuItem>
                    ))}
                </Select>
                {isCustomPeriod &&
                    <> 
                        <TextField label="From Date" variant="outlined" type={"date"} value={format(state[`fromDate${index}`], 'yyyy-MM-dd')}
                                    sx={{ ...selectStyle, width: isCompare ? '100%' : '9rem', height: '2.188rem', m: 0,
                                        '& .MuiInputBase-root': {height: '2.188rem'},
                                    }}
                                    onChange={(e) => {
                                        const fromDate = new Date(e.target.value);
                                        if (!isNaN(fromDate.getTime())) {
                                            setState((prevState) => ({...prevState, [`fromDate${index}`]: fromDate, [`dateRange-${index}`]: SELECT_RANGE}))
                                        } else {
                                            console.warn("Invalid date format");
                                        }
                                    }}
                                    slotProps={{htmlInput: {max: new Date().toISOString().split('T')[0]}}}
                                    InputLabelProps={{ shrink: true }}
                        />
                        <TextField label="To Date" variant="outlined" type={"date"} value={format(state[`to_date${index}`], 'yyyy-MM-dd')}
                                    sx={{ ...selectStyle, width: isCompare ? '100%' : '9rem', height: '2.188rem', m: 0,
                                        '& .MuiInputBase-root': {height: '2.188rem'},
                                    }}
                                    onChange={(e) => {
                                        const to_date = new Date(e.target.value);
                                        if (!isNaN(to_date.getTime())) {
                                            setState((prevState) => ({...prevState, [`to_date${index}`]: to_date, [`dateRange-${index}`]: SELECT_RANGE}))
                                        } else {
                                            console.warn("Invalid date format");
                                        }
                                    }}
                                    slotProps={{htmlInput: {
                                        min: new Date(state[`fromDate${index}`]).toISOString().split('T')[0],
                                        max: new Date().toISOString().split('T')[0]
                                    }}}
                                    InputLabelProps={{ shrink: true }}
                        />
                    </>
                }
            </Box>
        )
    }
    
    const RunButton = (props: any) => (
        <Button
            loading={state.loading.isGradeOptionsLoading}
            disabled={state.clientValue === SELECT_CLIENT || state.loading.isGradeOptionsLoading}
            variant={"contained"}
            size='medium'
            onClick={() => {
                setState((prevState: any) => ({...prevState, isRun: true}));
            }}
            {...props}
            startIcon={<AutoFixHighIcon/>}
            label="Run"
        >
            <AutoFixHighIcon/>
            <Typography variant='button' sx={{ml: 1}}>Run</Typography>
        </Button>
    )

    return (
        <Card sx={{
            rowGap: 1,
            // padding: "0.5rem",
            padding: "1rem",
            marginBottom: "0.8rem",
            borderRadius: "0.8rem",
            border: (theme) => theme.palette.mode === 'dark' ? '0.063rem solid #333' : '0.063rem solid #e2e8f0',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#423d3d' : 'white',
            boxShadow: '0 0.063rem 0.188rem rgba(0,0,0,0.02), 0 0.063rem 0.125rem rgba(0,0,0,0.04)'
        }}>
            <Box sx={theme => ({
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: "wrap", gap: 1,
                [theme.breakpoints.up("md")]: {
                    flexWrap: "nowrap"
                }
            })}>
                <ViewSettings 
                    isMacro={isMacro}
                    setIsMacro={setIsMacro} 
                    togglePassFail={togglePassFail} 
                    isCompare={isCompare} 
                    toggleCompare={toggleCompare}
                    locationState={locationRefData}
                    isMacroBoardUpdate={boardUpdates.isMacro}
                />
                <Stack sx={theme => ({
                    flexDirection: "row", flexWrap: 'wrap', alignItems: "center", gap: 1, 
                    [theme.breakpoints.down("md")]: {
                        width: "100%"
                    } 
                })}>
                    {!isRegularSchoolFlavored() &&
                        <Select value={state.clientValue} sx={theme => ({
                                    ...selectStyle, 
                                    [theme.breakpoints.up("xs")]: {
                                        width: "100%"
                                    },
                                    [theme.breakpoints.up('md')]: {
                                        width: "16rem"
                                    }
                                })}
                                input={<OutlinedInput />}
                                renderValue={(selected) => {
                                    const selectedClient = state.clientOptions.find(option => option.id === selected)?.name;
                                    return (
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            {state.loading.isClientOptionsLoading ?
                                                <span style={{fontSize: '0.9rem', color: "gray"}}>Loading... <CircularProgress color="inherit" size={'0.8rem'}/></span> :
                                                state.clientValue === SELECT_CLIENT ?
                                                    <Typography color={"gray"}> {SELECT_CLIENT}</Typography> :
                                                    <Tooltip title={selectedClient} style={{
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        width: '100%'
                                                    }}>{selectedClient}</Tooltip>}
                                        </Box>
                                    )
                                }}
                                onChange={(e) => {
                                    setState((prevState: any) => ({...prevState, clientValue: e.target.value}))
                                }}>
                            <MenuItem value={SELECT_CLIENT} sx={{fontSize: 15, paddingY: 0, display: "none"}} disabled>
                                {SELECT_CLIENT}</MenuItem>
                            {state.clientOptions.filter(item => item?.standard).map((option) => (
                                <MenuItem value={option?.id}>{`${option?.name} ${option?.standard?.name ? '(' + option?.standard?.name + ')' : ''}`}</MenuItem>
                            ))}
                        </Select>
                    }
                    {!isCompare && renderDateRangeFilters()}
                    <Select value={state.initialGradeFilter}
                            sx={theme => ({
                                ...selectStyle, 
                                '& .MuiSelect-select': {padding: '0.625rem 0.313rem'},
                                [theme.breakpoints.between("xs", "md")]: {
                                    width: "100%"
                                },
                                [theme.breakpoints.up('md')]: {
                                    width: "16rem"
                                }
                            })}
                            onChange={(e) => {
                                setState((prevState: any) => ({...prevState, initialGradeFilter: e.target.value}))
                            }}
                            disabled={state.loading.isGradeOptionsLoading}
                            renderValue={(selected) => {
                                const selectedLable = state.gradeOptions.find(option => option.id === selected)?.name || selected;
                                return (
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <GradeOutlinedIcon color={'action'} sx={{paddingRight: '0.2rem'}}/>
                                        {state.loading.isGradeOptionsLoading ?
                                            <span style={{fontSize: '0.9rem', marginLeft: '1rem'}}>
                                            Loading.. <CircularProgress color="inherit"
                                                                        size={'0.8rem'}/>
                                        </span> :
                                            selectedLable === ALL_GRADES ?
                                                <Typography> {ALL_GRADES}</Typography>
                                                : <Tooltip title={selectedLable} style={{
                                                    width: "100%",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}>{selectedLable}</Tooltip>}

                                    </Box>
                                )
                            }}
                    >
                        <MenuItem value={ALL_GRADES}>{ALL_GRADES}</MenuItem>
                        {sortGrades(state.gradeOptions).map((option) => (
                            <MenuItem value={option?.id} key={option?.id}>
                                {option?.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {!isCompare && <RunButton/>}
                </Stack>
            </Box>
            {isCompare && 
                <Box sx={theme => ({ 
                    display: "flex", width: "100%", alignItems: 'center', justifyContent: "flex-end", gap: 1,
                    flexWrap: "wrap",
                    [theme.breakpoints.up("md")]: {
                        flexWrap: "nowrap",
                        justifyContent: "space-between"
                    }
                })}>
                <Grid container alignItems={"center"} justifyContent={"space-between"}>
                    <Grid item xs={5.8}>
                        <Typography variant='caption'>From Period</Typography>
                        {renderDateRangeFilters()}
                    </Grid>
                    <Grid item xs={5.8}>
                        <Typography variant='caption'>To Period</Typography>
                        {renderDateRangeFilters("2")}
                    </Grid>
                </Grid>
                <RunButton sx={theme => ({
                    [theme.breakpoints.up("md")]: { mt: "1.2rem" }
                })}/>
            </Box>}
        </Card>
    )
}


const ViewSettings = ({ isMacro, setIsMacro, togglePassFail, isCompare, toggleCompare, locationState, isMacroBoardUpdate }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { state: { showBackBtn }, toggleShowBack, backToPrevious } = useReport();
    const open = Boolean(anchorEl);

    // Helper to get current view label
    const getCurrentViewLabel = () => {
        if (isMacro && !isCompare) return ReportViewModes.MACRO_REPORT;
        if (isMacro && isCompare) return ReportViewModes.MACRO_WITH_COMPARE_REPORT;
        if (!isMacro && !isCompare) return ReportViewModes.MICRO_REPORT;
        if (!isMacro && isCompare) return ReportViewModes.MICRO_WITH_COMPARE_REPORT;
        return "Report";
    };

    const handleViewOptionChange = (value) => {
        switch (value) {
            case "micro":
                if (isMacro) togglePassFail();
                if (isCompare) toggleCompare();
                setIsMacro(false);
                break;
            case "macro":
                if (!isMacro) togglePassFail();
                if (isCompare) toggleCompare();
                setIsMacro(true);
                break;
            case "micro_with_compare":
                if (isMacro) togglePassFail();
                if (!isCompare) toggleCompare();
                setIsMacro(false);
                break;
            case "macro_with_compare":
                if (!isMacro) togglePassFail();
                if (!isCompare) toggleCompare();
                setIsMacro(true);
                break;
            default:
                break;
        }
        setAnchorEl(null);
    };

    const handleBackToMacro = () => {
        backToPrevious();
        if (locationState && locationState.gradeId && !isMacroBoardUpdate) {
            togglePassFail()
            setIsMacro(true)
        }
        toggleShowBack(false);
    }

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showBackBtn == true && <IconButton onClick={handleBackToMacro}>
                <KeyboardReturn />
            </IconButton>}
            <Typography fontSize="1.2rem" fontWeight="bold">
                {getCurrentViewLabel()}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <TuneIcon />
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>

                <MenuItem
                    selected={isMacro && !isCompare}
                    onClick={() => handleViewOptionChange("macro")}
                >
                    {ReportViewModes.MACRO_REPORT}
                </MenuItem>
                <MenuItem
                    selected={isMacro && isCompare}
                    onClick={() => handleViewOptionChange("macro_with_compare")}
                >
                    {ReportViewModes.MACRO_WITH_COMPARE_REPORT}
                </MenuItem>
                <MenuItem
                    selected={!isMacro && !isCompare}
                    onClick={() => handleViewOptionChange("micro")}
                >
                    {ReportViewModes.MICRO_REPORT} 
                </MenuItem>
                <MenuItem
                    selected={!isMacro && isCompare}
                    onClick={() => handleViewOptionChange("micro_with_compare")}
                >
                    {ReportViewModes.MICRO_WITH_COMPARE_REPORT}
                </MenuItem>
            </Menu>
        </Box>
    );
};