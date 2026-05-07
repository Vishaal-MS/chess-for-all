import React, {useEffect, useState} from "react";
import {Button, useListContext, useNotify, useUnselect,useUnselectAll} from "react-admin";
import {ClassProgressStatus} from "../../helpers/constants.ts";
import { closeDialog, remoteLog } from "@mahaswami/vc-frontend";


export const BulkAddLessonsButton = ({
                                         selectedCurriculumId, dataProvider, classId, curriculumId,
                                         refreshFn, postAssign, curriculumCount, classProgressCount, isSchoolClass
                                     }) => {
    const { resource,selectedIds, onUnselectItems } = useListContext();
    const notify = useNotify();
    const unselect = useUnselect(resource);
    const [loading, setLoading] = useState(false); // Track loading state

    useEffect(() => {
        if (selectedCurriculumId && selectedIds?.length > 0) {
            onUnselectItems(); // Unselect all items when a new curriculum is selected
        }
    }, [selectedCurriculumId]);

    const handleClick = async () => {
        setLoading(true); // Set loading state to true to show progress
        const promises = [];

        //For each selected lesson, create a new class_progress record
        //Wait for all updates to finish and then notify

        let curriculumLessons = [];
        if (classId) {
            const {data: selectedCurricumLessons} = await dataProvider.getList('curriculum_lessons', {
                filter: { curriculum_id: selectedCurriculumId, lesson_id: selectedIds },
                pagination: { page: 1, perPage: 10000 },
                meta: { scopingEscapeHatch: true, prefetch:['curriculum'] }
            });
            curriculumLessons = selectedCurricumLessons;
        }

        selectedIds.forEach((lessonId) => {
            if (classId) {
                const curriculumLesson = curriculumLessons.find(lesson => lesson.lesson_id === lessonId);
                classProgressCount = classProgressCount + 1;
                let payload: any = {
                    class_id: classId,
                    lesson_id: lessonId,
                    status: ClassProgressStatus.SCHEDULED,
                    position_number: classProgressCount,
                    is_assigned: false,
                    is_limit_to_show_single_section: curriculumLesson?.is_limit_to_show_single_section,
                    mapping1_standard_section_id: isSchoolClass ? curriculumLesson?.mapping1_standard_section_id : null,
                    mapping2_standard_section_id: isSchoolClass ? curriculumLesson?.mapping2_standard_section_id : null,
                    mapping3_standard_section_id: isSchoolClass ? curriculumLesson?.mapping3_standard_section_id : null,
                    mapping1_cognitive_skill_id: isSchoolClass ? curriculumLesson?.mapping1_cognitive_skill_id : null,
                    mapping2_cognitive_skill_id: isSchoolClass ? curriculumLesson?.mapping2_cognitive_skill_id : null,
                    mapping3_cognitive_skill_id: isSchoolClass ? curriculumLesson?.mapping3_cognitive_skill_id : null,
                    is_game_sound_enabled: curriculumLesson?.is_game_sound_enabled,
                    is_voice_over_enabled: curriculumLesson?.is_voice_over_enabled,
                    is_preview_enabled: curriculumLesson?.is_preview_enabled
                }
                const curriculum = curriculumLesson.curriculum;
                if (curriculum?.is_background_music_enabled === true && curriculum?.background_music_id) {
                    payload.background_music_id = curriculum.background_music_id;
                }
                const createPromise = dataProvider.create('class_progress', {data: payload})
                promises.push(createPromise);
            } else if (curriculumId) {
                curriculumCount = curriculumCount + 1;
                const payload = {
                    curriculum_id: curriculumId,
                    lesson_id: lessonId,
                    position_number: curriculumCount,
                    is_limit_to_show_single_section: false,
                    is_game_sound_enabled: false,
                    is_voice_over_enabled: false,
                    // is_preview_enabled: false
                }
                const createPromise = dataProvider.create('curriculum_lessons', {data: payload})
                    .then((data) => {
                        console.log('Added Lesson to Curriculum', data);
                    })
                promises.push(createPromise);
            } else if (curriculumId) {
                curriculumCount = curriculumCount + 1;
                const createPromise = dataProvider.create('curriculum_lessons', {
                    data: {
                        curriculum_id: curriculumId,
                        lesson_id: lessonId,
                        position_number: curriculumCount
                    }
                })
                    .then((data) => {
                        console.log('Added Lesson to Curriculum', data);
                    })
                promises.push(createPromise);
            }
        });
        try {
            await Promise.all(promises);
            notify('Lessons added successfully', {type: 'success'});
            unselect(selectedIds);
            postAssign?.()
            refreshFn();
        }
        catch (error) {
            console.error('Error adding lessons', error);
            notify('Error adding lessons', { type: 'error' });
            remoteLog("Error sending on BulkAddLessonsButton: ", error);
        }
        finally{
            closeDialog()
            setLoading(false); // Reset loading state
        }
    }

    return (
        <Button label="Add Lessons" variant="contained" onClick={handleClick} loading={loading} />
    );
}
