import {Title, useSidebarState} from "react-admin";
import {useEffect, useMemo, useRef, useState} from "react";
import {Box, Typography} from "@mui/material";
import {BoardHeader, rangeMap} from "./BoardHeader.tsx";
import {BoardStandard} from "./BoardStandard.tsx";
import {PerformanceSummary} from "./PerformanceSummary.tsx";
import {ProgressBarChart} from "./ProgressBarChart.tsx";
import CircularProgress from "@mui/material/CircularProgress";
import {isAfter, isBefore, isSameDay, subDays} from "date-fns";
import {getDateRange, stringToVibrantColor} from "../../utils.ts";
import {useLocation} from "react-router-dom";
import {AssignmentStatus, getCurrentDateRange, getPreviousDateRange} from "../../helpers/constants.ts";
import { ReportContext } from "./ReportContext.tsx";

const BoardReport = () => {
    const CURRENT_DATE_RANGE = getPreviousDateRange();
    const TO_PERIOD_DATE_RANGE = getCurrentDateRange();
    const dataProvider = window.swanAppFunctions.dataProvider;
    const [sideBarOpen, setSidebarOpen] = useSidebarState();
    const location = useLocation();
    const range = rangeMap[CURRENT_DATE_RANGE];
    const toRange = rangeMap[TO_PERIOD_DATE_RANGE];
    let { from: defaultFromDate, to: defaultToDate } = getDateRange(range);
    let { from: defaultToPeriodFromDate, to: defaultToPeriodToDate } = getDateRange(toRange);
    let fromDate1 = new Date(defaultFromDate);
    let toDate1 = new Date(defaultToDate);
    let fromDate2 = new Date(defaultToPeriodFromDate);
    let toDate2 = new Date(defaultToPeriodToDate);
    let dateRange = CURRENT_DATE_RANGE;
    let dateRange2 = TO_PERIOD_DATE_RANGE;
    let isCompare = false;
    let clientValue = 'Select Client';
    let initialGradeFilter = 'All Grades';
    if (location.state) {
         dateRange = location.state?.dateRange || CURRENT_DATE_RANGE;
         dateRange2 = location.state?.dateRange2 || TO_PERIOD_DATE_RANGE;
         isCompare = location.state?.isCompare || false;
         fromDate1 = new Date(location.state?.fromDate1);
         toDate1 = new Date(location.state?.toDate1);
         fromDate2 = new Date(location.state?.fromDate2);
         toDate2 = new Date(location.state?.toDate2);
         clientValue = location.state?.clientValue;
         initialGradeFilter = location.state?.gradeId;
    }
    const [state, setState] = useState({
        dateRange: dateRange,
        dateRange2: dateRange2,
        gradeFilter: 'All Grades',
        clientValue: clientValue,
        minDate: subDays(new Date(), 30),
        clientOptions: [],
        gradeOptions: [],
        isRun: false,
        isCompare: isCompare,
        fromDate: fromDate1,
        fromDate2: fromDate2,
        to_date: toDate1,
        to_date2: toDate2,
        loading: {
            isClientOptionsLoading: false,
            isGradeOptionsLoading: false,
        },
        showBackBtn: false,
        initialGradeFilter: initialGradeFilter,
    });
    const previousState = useRef<any>(state);
    const [boardUpdates, setBoardUpdates] = useState({
        dateRange: '',
        standardName: '',
        isBoardUpdated: false,
        sectionReport: [{}],
        gradeReport: [{}],
        skillReport: [{}],
        isLoading: false,
        totalAssignedStudentCount: 0,
        totalCompletedStudentCount: 0,
        totalAssignedBlockCounts: 0,
        totalAssignmentCounts: 0,
        isMacro: !location.state,
        growthRate: {
            totalAssignedStudentPercentage: 0,
            totalAssignedBlockPercentage: 0,
            totalAssignmentPercentage: 0
        }
    });

    const locationState = useRef(location.state || {});

    useEffect(() => {
        if (state.isRun) {
            handleRunReport().then(() => {
                setState((prevState) => ({...prevState, isRun: false}));
                setBoardUpdates((prevState) => ({...prevState, isBoardUpdated: true, isLoading: false}));
            });
        }
    }, [state.isRun]);

    useEffect(() => {
        if (sideBarOpen) {
            setSidebarOpen(false);
        }
    }, []);

    const handleRunReport = async () => {
        setBoardUpdates((prevState) => ({...prevState, dateRange: state.dateRange, isLoading: true}));
        // Fetching students and assignments based on selected grade and client
        await handleFetchStudentsAndAssignments();
    }

    const handleFetchStudentsAndAssignments = async () => {
        const allGradeList = state.gradeOptions.map(grade => grade.id);
        const gradeIds = state.initialGradeFilter === 'All Grades' ? allGradeList : [state.initialGradeFilter];
        setState((prevState) => ({...prevState, gradeFilter: state.initialGradeFilter}));
        const standardId = state.clientOptions.find(client => client.id === state.clientValue)?.standard_id;
        const clientId = state.clientValue;

        const {data: standard} = await dataProvider.getOne('standards', {id: standardId});
        setBoardUpdates(prevState => ({...prevState, standardName: standard?.name || ''}));
        const {data: classes} = await dataProvider.getList('classes', {
            filter: {client_id: clientId, status_neq: 'draft', is_school_class: true},
           pagination: {page: 1, perPage: 10000},
        });

        const classIds = classes.map(classRecord => classRecord.id);
        const [{data: classProgressByClasses}, {data: studentsByGrade}] = await Promise.all([
                dataProvider.getList('class_progress', {
                    filter: {class_id: classIds},
                    pagination: {page: 1, perPage: 10000},
                    meta: {prefetch: ['standard_sections', 'cognitive_skills']},
                }),
                dataProvider.getList('students', {
                    filter: {standard_grade_id: gradeIds, client_id: clientId},
                    pagination: {page: 1, perPage: 10000},
                    meta: {prefetch: ['users']},
                })
            ]
        )

        const studentIds = [...new Set(studentsByGrade.map(student => student.id))];
        const lessonIds = [...new Set(classProgressByClasses.map(progress => progress.lesson_id))];
        const categoryIds = [
            ...new Set(
                classProgressByClasses.flatMap(progress => [
                    progress.mapping1_standard_section?.standard_category_id,
                    progress.mapping2_standard_section?.standard_category_id,
                    progress.mapping3_standard_section?.standard_category_id
                ]).filter(Boolean)
            )
        ];
        const [{data: assignments}, { data: enrollments}] = await Promise.all([
            dataProvider.getList('assignments', {
                filter: {student_id: studentIds, lesson_id: lessonIds, class_id: classIds, is_assessment: true},
                meta: {prefetch: ['students']},
                pagination: {page: 1, perPage: 10000}
            }),
            dataProvider.getList('enrollments', {
                filter: {student_id: studentIds, class_id: classIds},
                pagination: {page: 1, perPage: 10000},
                meta: {prefetch: ['students']},
            })
        ])

        const dateRangedAssignments = assignments.filter((assign: any) => {
            const assign_date = new Date(assign.assigned_timestamp);
            let periodFromDate = state.fromDate;
            let periodToDate = state.to_date;
            if (state.isCompare) {
                periodFromDate = state.fromDate2;
                periodToDate = state.to_date2;
            }
            return (
                (isSameDay(assign_date, periodFromDate) || isAfter(assign_date, periodFromDate)) &&
                (isBefore(assign_date, periodToDate) || isSameDay(assign_date, periodToDate))
            );
        });

        // Filtering assignments for the previous period range.

        const previousPeriodRangeAssign = assignments.filter((assign: any) => {
            if (!state.isCompare) return;
            const prevFromDate = state.fromDate;
            const prevToDate = state.to_date;
            const assign_date = new Date(assign.assigned_timestamp);
            return (
                (isSameDay(assign_date, prevFromDate) || isAfter(assign_date, prevFromDate)) &&
                (isBefore(assign_date, prevToDate) || isSameDay(assign_date, prevToDate))
            );
        });

        const {data: categories} = await dataProvider.getList('standard_categories', {
            filter: {id: categoryIds},
            pagination: {page: 1, perPage: 10000},
        });
        await handleGradeAndPerformanceSummary(dateRangedAssignments, gradeIds, previousPeriodRangeAssign);
        await handleCognitiveSkillsAndSectionsFetch(classProgressByClasses, dateRangedAssignments, gradeIds, categories, previousPeriodRangeAssign, studentsByGrade, enrollments)

    }

    const handleGradeAndPerformanceSummary = async (assignments, gradeIds, previousPeriodRangeAssign) => {

        let totalAssignedStudentCount = 0;
        let totalCompletedStudentCount = 0;
        let totalAssignmentBlockCount = 0;
        let totalAssignmentCounts = 0;

        let previousAssignedStudentsCount = 0;
        let previousTotalBlocksCount = 0;
        let previousTotalAssignmentsCount = 0;
        let previousCompletedStudentsCount = 0;

        const gradeArrayObj = [];
        gradeIds.forEach(gradeId => {
            let gradeObj = {}
            // Performance Summary - Fetching assignments and students for each grade
            const assignedStudentsCount = [...new Set(assignments.filter(assign => assign.student.standard_grade_id === gradeId).map(assign => assign.student_id))].length;
            const completedStudents = [...new Set(assignments.filter(assign => assign.student.standard_grade_id === gradeId).map(assign => assign.student_id))];

            const completedStudentCount = completedStudents.filter(studentId => {
                const studentAssignments = assignments.filter(assign => assign.student.standard_grade_id === gradeId && assign.student_id === studentId);
                return studentAssignments.every(assign => assign.status === AssignmentStatus.COMPLETED);
            }).length;
            
            const totalBlocks = assignments.filter(assign => assign.student.standard_grade_id === gradeId).sum(a => parseInt(a.total_blocks) || 0);
            const totalAssignments = assignments.filter(assign => assign.student.standard_grade_id === gradeId).map(assign => assign.lesson_id).length;

            //Previous Period Growth Rate Calculation
            const previousAssignedStudents = [...new Set(previousPeriodRangeAssign.filter(assign => assign.student.standard_grade_id === gradeId).map(assign => assign.student_id))].length;
            const previousTotalBlocks = previousPeriodRangeAssign.filter(assign => assign.student.standard_grade_id === gradeId).sum(a => parseInt(a.total_blocks) || 0);
            const previousTotalAssignments = previousPeriodRangeAssign.filter(assign => assign.student.standard_grade_id === gradeId).map(assign => assign.lesson_id).length;
            const previousCompletedStudents = [...new Set(previousPeriodRangeAssign.filter(assign => assign.student.standard_grade_id === gradeId && assign.status === AssignmentStatus.COMPLETED).map(assign => assign.student_id))];
            const previousCompletedStudentCount = previousCompletedStudents.filter(studentId => {
                const studentAssignments = previousPeriodRangeAssign.filter(assign => assign.student.standard_grade_id === gradeId && assign.student_id === studentId);
                return studentAssignments.every(assign => assign.status === AssignmentStatus.COMPLETED);
            }).length;

           //Grade Report Processing
            const gradeName = state.gradeOptions.find(grade => grade.id === gradeId)?.name || 'Unknown Grade';

            if(assignedStudentsCount !== 0) {
                gradeObj = {
                    label: gradeName,
                    gradeId: gradeId,
                    value: completedStudentCount,
                    total: assignedStudentsCount,
                    color: stringToVibrantColor(gradeName, true),
                    percent: assignedStudentsCount === 0 ? 0 : Math.round((completedStudentCount / assignedStudentsCount) * 100),
                    growthRate: previousCompletedStudentCount === 0 ? 0 : Math.round(((completedStudentCount - previousCompletedStudentCount) / previousCompletedStudentCount) * 100),
                }
                gradeArrayObj.push(gradeObj);
            }

            totalAssignedStudentCount += assignedStudentsCount;
            totalCompletedStudentCount += completedStudentCount;
            totalAssignmentBlockCount += totalBlocks;
            totalAssignmentCounts += totalAssignments;

            previousAssignedStudentsCount += previousAssignedStudents;
            previousTotalBlocksCount += previousTotalBlocks;
            previousTotalAssignmentsCount += previousTotalAssignments;
            previousCompletedStudentsCount += previousCompletedStudentCount;
        });


        const growthRate = {
            totalAssignedStudentPercentage: previousAssignedStudentsCount === 0 ? 0
                : Math.round(((totalAssignedStudentCount - previousAssignedStudentsCount) / previousAssignedStudentsCount) * 100),
            totalCompletedStudentPercentage: previousCompletedStudentsCount === 0 ? 0
                : Math.round(((totalCompletedStudentCount - previousCompletedStudentsCount) / previousCompletedStudentsCount) * 100),
            totalAssignedBlockPercentage: previousTotalBlocksCount === 0 ? 0
                : Math.round(((totalAssignmentBlockCount - previousTotalBlocksCount) / previousTotalBlocksCount) * 100),
            totalAssignmentPercentage: previousTotalAssignmentsCount === 0 ? 0
                : Math.round(((totalAssignmentCounts - previousTotalAssignmentsCount) / previousTotalAssignmentsCount) * 100),
            isActiveStudentNoChange: totalCompletedStudentCount === previousCompletedStudentsCount,
            isActivitiesNoChange: totalAssignmentBlockCount === previousTotalBlocksCount,
            isAssignmentNoChange: totalAssignmentCounts === previousTotalAssignmentsCount,
        }

        setBoardUpdates(prevState => {
            return {
                ...prevState,
                gradeReport: gradeArrayObj,
                gradeFilter: state.gradeFilter,
                totalAssignedStudentCount: totalAssignedStudentCount,
                totalCompletedStudentCount: totalCompletedStudentCount,
                totalAssignedBlockCounts: totalAssignmentBlockCount,
                totalAssignmentCounts: totalAssignmentCounts,
                growthRate: growthRate,
            };
        })
    }

    const cognitiveSkillMaps = [new Map(), new Map(), new Map()];
    const sectionMaps = [new Map(), new Map(), new Map()];

    const getCognitiveSkillData = (progress,assignmentsByCognitiveSkills, index) => {
        const skillId = progress[`mapping${index + 1}_cognitive_skill_id`];
        const skillName = progress[`mapping${index + 1}_cognitive_skill`]?.name;

        if (!skillId) return;

        const map = cognitiveSkillMaps[index];
        const totalStudentIds = [...new Set(assignmentsByCognitiveSkills.map(a => a.student_id))];
        const completedStudentIds = [...new Set(assignmentsByCognitiveSkills.filter(a => a.status === AssignmentStatus.COMPLETED).map(a => a.student_id))];
        if (map.has(skillId)) {
            const existing = map.get(skillId);
            existing.totalStudentIds = Array.from(new Set([...existing.totalStudentIds, ...totalStudentIds]));
            existing.completedStudentIds = Array.from(new Set([...existing.completedStudentIds, ...completedStudentIds]));
        } else {
            if(totalStudentIds?.length > 0) {
                map.set(skillId, {
                    id: skillId,
                    label: skillName || '',
                    totalStudentIds: totalStudentIds,
                    completedStudentIds: completedStudentIds
                });
            }
        }
    }

    const getSectionData = async (progress, categories, assignmentsByCognitiveSkills, previousPeriodAssignments, index, students, enrollments) => {
        const sectionId = progress[`mapping${index + 1}_standard_section_id`];
        const section = progress[`mapping${index + 1}_standard_section`];
        if (!sectionId) return;

        const map = sectionMaps[index];
        const totalAssignmentBlock = assignmentsByCognitiveSkills.sum(a => parseInt(a.total_blocks) || 0);
        const totalCompletedBlock = assignmentsByCognitiveSkills.sum(a => parseInt(a.completed_blocks) || 0);
        const previousAssignmentCompletedBlocks = previousPeriodAssignments.sum(a => parseInt(a.completed_blocks) || 0);
        const category = categories.find(cat => cat.id === section?.standard_category_id);
        const failedStudents = assignmentsByCognitiveSkills.filter(a => a.status !== AssignmentStatus.COMPLETED);
        const uniqueUserMap = new Map();

        failedStudents.forEach(failedStudent => {
            const userId = failedStudent.student.user_id;
            if (!uniqueUserMap.has(userId)) {
                const student = students.find(s => s.user_id === userId);
                const enrollment = student && enrollments.find(e => e.student_id === student.id && e.class_id === failedStudent.class_id);
                if (student && enrollment) {
                    uniqueUserMap.set(userId, {
                        userId,
                        name: `${student.user.first_name} ${student.user.last_name}`,
                        enrollmentId: enrollment.id,
                    });
                }
            }
        });

        const failedStudentList = Array.from(uniqueUserMap.values());


        if (map.has(sectionId)) {
            const existing = map.get(sectionId);
            existing.total += totalAssignmentBlock;
            existing.value += totalCompletedBlock;
            existing.previousTotal += previousAssignmentCompletedBlocks;

            const mergedFailed = [...existing.failedStudents, ...failedStudentList];
            const mergedMap = new Map(mergedFailed.map(s => [s.userId, s]));
            existing.failedStudents = Array.from(mergedMap.values());
        } else {
            map.set(sectionId, {
                id: sectionId,
                name: section?.name,
                title: category ? category.name : 'Unknown Category',
                color: stringToVibrantColor(`${category?.name ?? ''} ${section?.code ?? ''}`),
                total: totalAssignmentBlock,
                value: totalCompletedBlock,
                previousTotal: previousAssignmentCompletedBlocks,
                code: section?.code,
                failedStudents: failedStudentList
            });
        }
    };


    const handleCognitiveSkillsAndSectionsFetch = async (classProgress,  assignments, gradeIds, categories, previousPeriodRangeAssign, students, enrollments) => {
        gradeIds.forEach(gradeId => {
            classProgress.forEach(progress => {
                const isSectionExist = (progress.mapping1_standard_section_id || progress.mapping2_standard_section_id || progress.mapping3_standard_section_id);
                const isCognitiveSkillExist = (progress.mapping1_cognitive_skill_id || progress.mapping2_cognitive_skill_id || progress.mapping3_cognitive_skill_id);

                if (isSectionExist || isCognitiveSkillExist) {
                    const assignmentsByCognitiveSkills = assignments.filter(assign => assign.lesson_id === progress.lesson_id && assign.class_id === progress.class_id && assign.student.standard_grade_id === gradeId);
                    const filteredPreviousAssignments = previousPeriodRangeAssign.filter(assign => assign.lesson_id === progress.lesson_id && assign.class_id === progress.class_id && assign.student.standard_grade_id === gradeId);
                    if (isCognitiveSkillExist) {
                        for (let i = 0; i < 3; i++) {
                            getCognitiveSkillData(progress, assignmentsByCognitiveSkills, i);
                        }
                    }
                    if (isSectionExist) {
                        for (let i = 0; i < 3; i++) {
                            getSectionData(progress, categories, assignmentsByCognitiveSkills, filteredPreviousAssignments, i, students,  enrollments);
                        }
                    }
                }
            })
        });


        // Combine and process cognitive skills
        const [cognitiveSkills1, cognitiveSkills2, cognitiveSkills3] = cognitiveSkillMaps.map(map => Array.from(map.values()));
        const combinedSkillsArray = [...cognitiveSkills1, ...cognitiveSkills2, ...cognitiveSkills3];
        const combinedSkillsMap = combinedSkillsArray.reduce((acc, skill) => {
            const { id, label, totalStudentIds, completedStudentIds } = skill;
            const totalStudentCount = totalStudentIds.length > 0 ? totalStudentIds.length : 0;
            const completedStudentCount = completedStudentIds.length > 0 ? completedStudentIds.length : 0;
            if (!acc[id]) {
                acc[id] = { id, label, total: totalStudentCount, value: completedStudentCount };
            } else {
                acc[id].total += totalStudentCount;
                acc[id].value += completedStudentCount;
            }
            return acc;
        }, {});
        const cognitiveSkillsReport = Object.values(combinedSkillsMap);

        // Combine and process sections
        const [sections1, sections2, sections3] = sectionMaps.map(map => Array.from(map.values()));
        const combinedSectionsArray = [...sections1, ...sections2, ...sections3];
        const combinedSectionsMap = combinedSectionsArray.reduce((acc, section) => {
            const { id, name, title, color, total, value, code, previousTotal, previousValue, failedStudents } = section;
            if (!acc[id]) {
                acc[id] = { id, name, title, color, total, value, code, previousTotal, previousValue, failedStudents };
            } else {
                acc[id].total += total;
                acc[id].value += value;
                acc[id].previousTotal += previousTotal;
                acc[id].failedStudents = failedStudents;
            }
            return acc;
        }, {});
        const combinedSectionsMapResult = Object.values(combinedSectionsMap);
        const sectionsReport = combinedSectionsMapResult
            .filter(s => s.total !== 0)
            .map(section => ({
                ...section,
                percent: section.total === 0 ? 0 : Math.round((section.value / section.total) * 100),
                growthPercentage: section.previousTotal === 0 ? 0
                    : Math.round(((section.value - section.previousTotal) / section.previousTotal) * 100)
            }));

        // Set the board updates with the processed data
        setBoardUpdates(prevState => ({
            ...prevState,
            skillReport: cognitiveSkillsReport,
            sectionReport: sectionsReport
        }));

    }

    const handlePassFailToggle = () => {
        setBoardUpdates((preValue) => ({...preValue, isMacro: !preValue.isMacro}));
    }

    const handleToggleCompare = () => {
        setState((prevState) => ({...prevState, isCompare: !prevState.isCompare}));
    }
    const isEmptyReport = boardUpdates.totalAssignmentCounts === 0 && boardUpdates.totalAssignedBlockCounts === 0;
    const isSamePeriods = state.fromDate.getTime() === state.fromDate2.getTime() && state.to_date.getTime() === state.to_date2.getTime();

    const renderReport = boardUpdates.isLoading ? (
        <Box sx={{mt: 'calc(50vh - 10rem)', textAlign: 'center', width: '100%'}}>
            <CircularProgress size="3rem"/>
        </Box>
    ) : isEmptyReport ? (
        <Box sx={{mt: 'calc(50vh - 10rem)', textAlign: 'center', width: '100%'}}>
            <Typography variant="h6" color="text.secondary" textAlign="center">
                No data available for the selected Period.
            </Typography>
        </Box>
    ) : state.initialGradeFilter !== state.gradeFilter ? (
        <Box sx={{mt: 'calc(50vh - 10rem)', textAlign: 'center', width: '100%'}}>
            <Typography variant="h6" color="text.secondary" textAlign="center">
                Please Click "Run" to update the report with the selected Grade.
            </Typography>
        </Box>
    ) : isSamePeriods ? (
        <Box sx={{mt: 'calc(50vh - 10rem)', textAlign: 'center', width: '100%'}}>
            <Typography variant="h6" color="text.secondary" textAlign="center">
                Please select different date ranges for comparison.
            </Typography>
        </Box>
    ) : (
        <>
            <PerformanceSummary boardUpdates={boardUpdates} state={state}/>
            {boardUpdates.isMacro && <ProgressBarChart boardUpdates={boardUpdates}/>}
            <BoardStandard boardUpdates={boardUpdates} setState={setState} state={state} previousState={previousState.current}/>
        </>
    )

    const toggleShowBack = (canShowBack?: boolean, updateState?: any) => {
        setState((prev) => {
            const newState = { ...prev, showBackBtn: canShowBack || !prev.showBackBtn };
            if (canShowBack == true) {
                previousState.current = updateState ? { ...newState, ...updateState } : newState;
            }
            return newState
        });
    };

    const backToPrevious = () => {
        if (previousState.current) {
            setState((prevState: any) => ({
                ...prevState,
                ...previousState.current,
                isRun: true,
            }));
        }
    }

    const value = useMemo(() => ({
        state,
        toggleShowBack,
        backToPrevious
    }), [state]);
    

    return (
        <ReportContext.Provider value={value}>
            <Title title={"Performance Report"}/>
            <Box sx={{
                padding: 2,
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#121212' : '#f4f7fa',
                height: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: 'column',
                gap: 1
            }}>

                <BoardHeader state={state} setState={setState} togglePassFail={handlePassFailToggle} toggleCompare={handleToggleCompare} locationState={locationState} boardUpdates={boardUpdates}/>
                {boardUpdates.isBoardUpdated ? renderReport:
                    <Box sx={{mt: 'calc(50vh - 10rem)', textAlign: 'center', width: '100%'}}>
                        {!boardUpdates.isLoading ?
                            <Typography variant="h6" color="text.secondary" textAlign="center">
                                Please choose Report Parameters and click "Run".
                            </Typography> :
                            <CircularProgress size="3rem"/>
                        }
                    </Box>}
            </Box>
        </ReportContext.Provider>
    );
}

export default BoardReport;