import {
    Show,
    TabbedShowLayout,
    useGetOne, ListBase,
    Button, TopToolbar, WithRecord, useSidebarState
} from 'react-admin';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import {ChessAIField} from "../../fields/ai_lesson/ChessAIField";
import {useState} from "react";
import { FullscreenPortal } from "../../components/FullscreenPortal";
import {useLocation, useNavigate} from "react-router-dom";
import {AssignmentList} from "./assignmentList.tsx";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {appTitlePrefix} from "../../configuration";
import {AssignmentsLiveGrid} from "./assignmentsLiveGrid";
import { Grid, Box, Typography } from "@mui/material";
import {AssignmentStatus} from "../../helpers/constants.ts";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {isOrgAdmin, isOrgCoach, isProCoach, isRegularSchoolFlavored} from "../../backend/common_logics.ts";
import {formatDateWithShortYear} from "../../utils.ts";
import {showDefaults} from "@mahaswami/vc-frontend";
import {LessonsReferenceField} from "../lessons.tsx";


const PostShowActions = ({ onPresent, onAssignmentsLive, classProgressId, classId}: { onPresent: any, onAssignmentsLive: any, classProgressId: number }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentTab = location.pathname.split('/').pop();

    return (
        <TopToolbar>
            {currentTab !== '1' &&
                <Button color="primary" label="Present" onClick={onPresent}>
                    <FullscreenIcon/>
                </Button>
            }
            <Button color="primary" label="Assignments Live Grid" onClick={onAssignmentsLive}>
                <PlayArrowIcon/>
            </Button>
            <Button onClick={() => navigate(`/classes/${classId}/show`)} style={{fontSize: 13}}
                    startIcon={<KeyboardReturnIcon />}  label={`Return To ${isRegularSchoolFlavored() ? "Teacher" : "Coach"} Workspace`}/>
        </TopToolbar>
    )
};

export const ClassProgressShow = (props: any) => {
    const classProgressId = Number(props?.id);
    const [isSidebarOpen, setSidebarVisibility] = useSidebarState();
    const { data: classProgress } = useGetOne("class_progress", { id: classProgressId, meta: {prefetch: ["classes", "standard_sections", "cognitive_skills"]} });
    const isSchoolClass = classProgress?.class?.is_school_class;
    const classId = classProgress?.class_id;
    const assignmentsFilter = {
        class_id: classProgress?.class_id,
        lesson_id: classProgress?.lesson_id,
        student_id: undefined
    }
    const liveAssignmentsFilter = {
        class_id: classProgress?.class_id,
        lesson_id: classProgress?.lesson_id,
        student_id: undefined,
        status: [AssignmentStatus.IN_PROGRESS, AssignmentStatus.NOT_STARTED]
    }
    const [fullscreen, setFullscreen] = useState(false);
    const [assignmentsLive, setAssignmentsLive] = useState(false);

    const {data : lesson} = useGetOne ('lessons', {id: classProgress?.lesson_id});
    const lessonName = lesson?.name || "";
    const classProgressShowTitle = `${appTitlePrefix()} - ${isRegularSchoolFlavored() ? "Teacher" : "Coach"} Workspace Show - ${lessonName}`;
    const navigate = useNavigate();
    const handleAssignmentList = () => {
        setAssignmentsLive(false);
        navigate(`/class_progress/${classProgressId}/show/1`)
    }
    if (assignmentsLive) {
        return (
            <Show { ...showDefaults(props) } title={classProgressShowTitle} actions={
                <TopToolbar>
                    <Button color="primary" label="Assignments List" onClick={handleAssignmentList}/>
                    <Button onClick={() => navigate(`/classes/${classId}/show`)} style={{fontSize: 13}} startIcon={<KeyboardReturnIcon />}  label={"Return To Coach Workspace"}/>
                </TopToolbar>
            }>
                <ListBase resource="assignments" filter={liveAssignmentsFilter} queryOptions={{meta: {prefetch: ['students']}}}>
                    <AssignmentsLiveGrid classId={classId}/>
                </ListBase>
            </Show>
        )
    }

    const handleOnAssignmentLive = () => {
        setAssignmentsLive(true);
        setSidebarVisibility(false);
    }

    return (
        <Show {...showDefaults(props)} title={classProgressShowTitle} actions={
            <PostShowActions
                onPresent={() => setFullscreen(true)}
                onAssignmentsLive={handleOnAssignmentLive}
                classProgressId={classProgressId}
                classId={classId}
            />
        }>
            <TabbedShowLayout syncWithLocation>
                <TabbedShowLayout.Tab label="Lesson">
                    {((classProgress?.start_date || isSchoolClass) && (isProCoach() || isOrgCoach() || isOrgAdmin())) &&
                    <StaticDateProgressBar classProgress={classProgress} isSchoolClass={isSchoolClass}/>}
                    <LessonsReferenceField source="lesson_id" reference="lessons" link={false} label={""}>
                        <FullscreenPortal
                            isActive={fullscreen}
                            onClose={() => setFullscreen(false)}>
                            <WithRecord render={record => <ChessAIField source="content" lessonId={record.id}/>}/>
                        </FullscreenPortal>
                    </LessonsReferenceField>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Assignments" >
                    <ListBase resource="assignments" filter={assignmentsFilter}>
                        <AssignmentList  classId={classId}/>
                    </ListBase>
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
        </Show>
    );
}

export const StaticDateProgressBar = ({ classProgress, isSchoolClass }) => {
    const sectionsFields = [
        classProgress?.mapping1_standard_section?.code || '',
        classProgress?.mapping2_standard_section?.code || '',
        classProgress?.mapping3_standard_section?.code || '',
    ]
    const cognitiveFields = [
        classProgress.mapping1_cognitive_skill?.name || '',
        classProgress.mapping2_cognitive_skill?.name || '',
        classProgress.mapping3_cognitive_skill?.name || '',
    ]
    const sectionCodes = sectionsFields.filter(Boolean).join(", ");
    const cognitiveSkills = cognitiveFields.filter(Boolean).join(", ");
    const isOneSection = sectionsFields.filter(Boolean).length === 1;
    const isOneCognitiveSkill = cognitiveFields.filter(Boolean).length === 1;
    return (
        <Box
            sx={{
                width: '100%',
                padding: '8px',
                background: '#f9f9f9',
                borderRadius: '8px',
                border: '1px solid #ddd',
                position: 'sticky',
                top: 48,
                zIndex: 1300,
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isSchoolClass ? "0.3rem" : 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>
                    {classProgress.start_date ? `Start Date: ${formatDateWithShortYear(classProgress?.start_date)}` : ""}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>
                    {classProgress.end_date ? `Completed Date: ${formatDateWithShortYear(classProgress.end_date)}` : ""}
                </Typography>
            </Box>
            <Grid container sx={{display: isSchoolClass ? "block" : "none"}}>
                <Grid item md={isOneSection ? 6 : 12} sx={{mb: !isOneSection ? "0.3rem" : 0}}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>
                        {sectionCodes.length ? `${isOneSection ? "STD-Section:": "STD-Sections: "} ${sectionCodes}` : ""}
                    </Typography>
                </Grid>
                <Grid item md={isOneCognitiveSkill ? 6 : 12}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#555' }}>
                        {cognitiveSkills.length ? `${isOneCognitiveSkill? "Cognitive Skill: " : "Cognitive Skills: " }${cognitiveSkills}` : ""}
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
};
