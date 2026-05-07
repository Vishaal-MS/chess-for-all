import {Button, ReferenceManyField, useRefresh} from "react-admin";
import {AddLessons} from "../addLessons.tsx";
import {openDialog, PER_PAGE, SensibleDefaultPagination} from "@mahaswami/vc-frontend";
import {Box} from '@mui/material';
import {ClassLessonsSorter} from "../../common/draggableLessons.tsx";


const Lessons = ({ classRecord, showLessonList, setShowLessonList }) => {

    const refresh = useRefresh();
    const isSchoolClass = classRecord?.is_school_class;

    if (showLessonList) {
        return (
            <AddLessons classRecord={classRecord} refreshFn={refresh} showLessonList={showLessonList} postAssign={() => setShowLessonList(false)}/>
        )
    }
    
    const showAddLessonDialog = () => {
        openDialog(<AddLessons classRecord={classRecord} refreshFn={refresh} width="80vw"/>);
    }

    return (
        <Box sx={{ height: 'calc(100vh - 15rem)'}}>
            <ReferenceManyField key={classRecord.id}
                                pagination={<SensibleDefaultPagination />}
                                perPage={PER_PAGE}
                                reference={"class_progress"}
                                target={"class_id"}
                                record={{ id: classRecord.id }}
                                sort={{field: 'position_number', order: 'ASC'}}
                                filter={{class_id: classRecord.id}} queryOptions={{meta: {prefetch: ['lessons', 'standard_sections', 'cognitive_skills']}}}>
                <ClassLessonsSorter recordId={classRecord.id} disableRedirect isSchoolClass={isSchoolClass}/>
            </ReferenceManyField>
            <Button onClick={showAddLessonDialog} variant="contained" sx={{marginY: '0.5rem' }} label="Add"/>
        </Box>
    )
}

export default Lessons;