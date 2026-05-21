import {Box, Card, Grid, Typography} from "@mui/material";
import {HtmlTooltip} from "../../components/HtmlTooltip.tsx";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {useNavigate} from "react-router-dom";
import { useReport } from "./ReportContext.tsx";

export const BoardStandard = ({boardUpdates, setState, state, previousState}) => {
    const sections = boardUpdates.sectionReport;
    const isMacro = boardUpdates.isMacro;
    const isCompare = state.isCompare;
    const gradeFilter = state.gradeFilter;
    const gradeReport = boardUpdates.gradeReport;
    const dateRange = state.dateRange;
    const { toggleShowBack } = useReport();


    const handleGradeClick = (gradeId) => {
        toggleShowBack(true);
        setState((prevState) => ({...prevState, initialGradeFilter: gradeId, isRun: true}));
    }

    if (gradeFilter === "All Grades" && isMacro) {
        return (
            <Card sx={{p: 2, mt: 2, borderRadius: "0.8rem" , backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#423d3d' : 'white'}}>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary" mb={2}>
                    {`Alignment with ${boardUpdates.standardName} Standard Grades`}
                </Typography>
                <Grid container spacing={3}>
                    {gradeReport.length === 0 && (
                        <Box sx={{alignItems: 'center', width: '100%', textAlign: 'center', py: 4}} >
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                No standard grades data available.
                            </Typography>
                        </Box>
                    )}
                    {gradeReport.map((grade, index) => <GradeBoard key={index} grade={grade} onGradeClick={handleGradeClick} isCompare={isCompare}/> )}
                </Grid>
            </Card>
        )
    } else if (gradeFilter === "All Grades" && !isMacro) {
        return null
    }

    return (
        <Card sx={{p: 2, mt: 2, borderRadius: "0.8rem" , backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#423d3d' : 'white'}}>
            <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                {`Alignment with ${boardUpdates.standardName} Standards`}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Translating chess activities into measurable academic skill-building exercises.
            </Typography>
            <Grid container spacing={3}>
                {sections.length === 0 && (
                    <Box sx={{alignItems: 'center', width: '100%', textAlign: 'center', py: 4}}>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            No standards data available.
                        </Typography>
                    </Box>)}
                {[...sections]?.sort((a, b) => a.code?.localeCompare(b.code))?.map((section, index) => <SectionBoard key={index} section={section} isMacro={isMacro} state={state} isCompare={isCompare} previousState={previousState}/> )}
            </Grid>
        </Card>
    )
}

const SectionBoard = ({ section, isMacro, state, isCompare, previousState }) => {
    const sectionValue = section.value;
    const sectionTotal = section.total;
    const value = isMacro ? sectionValue : sectionTotal - sectionValue;
    const failedStudents = section?.failedStudents || null;
    const gradeId = state.gradeFilter;
    const clientValue = state.clientValue;
    const navigate = useNavigate();

    let stateParams = {
        from: 'board_report',
        gradeId: gradeId,
        dateRange: state.dateRange,
        dateRange2: state.dateRange2,
        isCompare: state.isCompare,
        clientValue: clientValue,
        fromDate1: state.fromDate || new Date(),
        toDate1: state.to_date || new Date(),
        fromDate2: state.fromDate2 || new Date(),
        toDate2: state.to_date2 || new Date(),
        previousState 
    };

    const handleStudentClick = (student) => {
        navigate(`/enrollments/${student.enrollmentId}/show`, {state: {data: stateParams}});
    }

    const isNoChange = (percentage) => {
        return percentage === 0;
    }
    const isUp = (percentage) => {
        return percentage > 0;
    }
    const getPercentage = (section) => isMacro ? section.percent : 100 - section.percent;

    if (value === 0) return;

    return (
        <Grid item xs={12} md={3}>
            <Box textAlign="center">
                <HtmlTooltip title={<Typography variant={"subtitle2"}>{`${value}/${sectionTotal} - (${getPercentage(section)}%)`}</Typography>} followCursor={true}>
                    <Box
                        sx={{
                            mx: 'auto',
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: `conic-gradient(${section.color} 0% ${getPercentage(section)}%, #e2e8f0 ${getPercentage(section)}% 100%)`,
                            display: 'grid',
                            placeItems: 'center',
                            mb: 2,
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                width: '70%',
                                height: '70%',
                                borderRadius: '50%',
                                boxShadow: `
                                inset 0 0 0.25rem rgba(0,0,0,0.2),
                                0 0.063rem 0.25rem rgba(0,0,0,0.1),
                                inset 0 0.125rem 0.188rem rgba(255,255,255,0.5)
                            `,
                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#423d3d' : 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                            }}
                        >
                            <Typography fontSize={"2.8rem"} lineHeight={"normal"} fontWeight={700}>
                                {getPercentage(section)}
                                <span style={{ fontSize: "1.2rem", marginLeft: "4px" }}>%</span>
                            </Typography>
                            {isCompare && <Box sx={{
                                backgroundColor: theme => isNoChange(section.growthPercentage) ? theme.palette.background.default : isUp(section.growthPercentage) ? '#f0fdf4' : '#fef2f2',
                                display: 'inline-block',
                                borderRadius: '62.438rem',
                                padding: '0.15rem 0.6rem',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: theme => isNoChange(section.growthPercentage) ? theme.palette.text.secondary : isUp(section.growthPercentage) ? '#10b981' : '#ef4444',
                            }}>
                                {!isNoChange(section.growthPercentage) &&
                                    section.growthPercentage !== 0 && (
                                        (section.growthPercentage > 0 ? <ArrowUpwardIcon
                                                sx={{verticalAlign: 'middle', fontSize: '0.8rem', marginRight: '0.188rem'}}/>
                                            : <ArrowDownwardIcon sx={{verticalAlign: 'middle', fontSize: '0.8rem', marginRight: '0.188rem'}}/> )
                                    )}
                                {section.growthPercentage}%
                            </Box>}
                        </Box>
                    </Box>
                </HtmlTooltip>
                <Typography fontWeight={600}>{section.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {section.code}
                </Typography>
                {failedStudents?.length > 0 && !isMacro && (
                    <Box mt={1} textAlign="center" sx={{ px: 2 }}>
                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                            {failedStudents.map((student, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleStudentClick(student)}
                                    style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        color: '#3b82f6',
                                        listStyleType: 'none',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        marginBottom: '0.25rem'
                                    }}
                                >
                                    {index + 1}. {student.name}
                                </li>
                            ))}
                        </ul>
                    </Box>
                )}

            </Box>
        </Grid>
    );
}

const GradeBoard = ({grade, onGradeClick, isCompare}) => {

    const gradeValue = grade.value;
    const gradeTotal = grade.total;
    const growthRate = grade.growthRate;

    const getPercentage = (grade) => grade.percent;

    const isNoChange = (percentage) => {
        return percentage === 0;
    }
    const isUp = (percentage) => {
        return percentage > 0;
    }

    return (
        <Grid item xs={12} md={3}>
            <Box textAlign="center">
                <HtmlTooltip
                    title={
                        <Typography variant="subtitle2">
                            {`${gradeValue}/${gradeTotal} - (${getPercentage(grade)}%)`}
                        </Typography>
                    }
                    followCursor
                >
                    <Box
                        onClick={() => onGradeClick?.(grade.gradeId)}
                        sx={{
                            mx: 'auto',
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: `conic-gradient(${grade.color} 0% ${getPercentage(grade)}%, #e2e8f0 ${getPercentage(grade)}% 100%)`,
                            display: 'grid',
                            placeItems: 'center',
                            mb: 2,
                            position: 'relative',
                            cursor: 'pointer', // 🔹 make it clickable
                        }}
                    >
                        <Box
                            sx={{
                                width: '70%',
                                height: '70%',
                                borderRadius: '50%',
                                boxShadow: `
                                    inset 0 0 0.25rem rgba(0,0,0,0.2),
                                    0 0.063rem 0.25rem rgba(0,0,0,0.1),
                                    inset 0 0.125rem 0.188rem rgba(255,255,255,0.5)
                                `,
                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#423d3d' : 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                            }}
                        >
                            <Typography fontSize={"2.8rem"} lineHeight={"normal"} fontWeight={700}>
                                {getPercentage(grade)}
                                <span style={{ fontSize: "1.2rem", marginLeft: "4px" }}>%</span>
                            </Typography>
                            {isCompare && <Box sx={{
                                backgroundColor: theme => isNoChange(growthRate) ? theme.palette.background.default : isUp(growthRate) ? '#f0fdf4' : '#fef2f2',
                                display: 'inline-block',
                                borderRadius: '62.438rem',
                                padding: '0.15rem 0.6rem',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: theme => isNoChange(growthRate) ? theme.palette.text.secondary : isUp(growthRate) ? '#10b981' : '#ef4444',
                            }}>
                                {!isNoChange(growthRate) &&
                                    growthRate !== 0 && (
                                        (growthRate > 0 ? <ArrowUpwardIcon
                                                sx={{verticalAlign: 'middle', fontSize: '0.8rem', marginRight: '0.188rem'}}/>
                                            : <ArrowDownwardIcon sx={{verticalAlign: 'middle', fontSize: '0.8rem', marginRight: '0.188rem'}}/> )
                                    )}
                                {growthRate}%
                            </Box>}
                        </Box>
                    </Box>
                </HtmlTooltip>
                <Typography fontWeight={600}>
                    {grade.label}
                </Typography>
            </Box>
        </Grid>
    );
}