import { remoteLog } from "@mahaswami/vc-frontend";

export async function updateResourceOrder (dataProvider,resource,data) {
    try {
        //For each record in data call dataProvider.update
        const promises = data.map(record => {
            return dataProvider.update(resource, {
                id: record.id,
                data: {
                    ...record,
                    order: record.order
                }
            });
        });
        //Wait for all promises to resolve
        const results = await Promise.all(promises);
        //Return the results
        return results.map(result => result.data);
    } catch (error) {
        remoteLog("Error sending on updateResourceOrder: ", error);
    }
}

export async function getCurriculumLessons(dataProvider) {
    try {
        const { data: curriculumLessons } = await dataProvider.getList('curriculum_lessons', {
            meta: {scopingEscapeHatch: true},
            pagination: {page: 1, perPage: 10000},
            sort: {field: 'position_number', order: 'ASC'}
        });
        return curriculumLessons;
    } catch (error) {
        remoteLog("Error sending getCurriculumLessonIds: ", error);
        console.error("Error on getCurriculumLessonIds: ", error);
    }
}

export async function getOwnAndSubscribedCurriculumIds(dataProvider, subscribedCurriculumIds, classId) {
    try {
        let curriculumIds;
        if (classId) {
            const { data: ownCurriculums } = await dataProvider.getList('curriculum', {
                pagination: { page: 1, perPage: 1000 }
            });
            const ownCurriculumIds = ownCurriculums.map(curriculum => curriculum.id);
            curriculumIds = [...ownCurriculumIds, ...subscribedCurriculumIds];
        } else {
            curriculumIds = subscribedCurriculumIds;
        }
        return curriculumIds;
    } catch (error) {
        remoteLog("Error sending getOwnAndSubscribedCurriculums: ", error);
    }
}

export async function handleCurriculumDuplicate(dataProvider, curriculumRecord, navigate) {
    if(curriculumRecord && curriculumRecord.curriculum_id) {
        const {data: curriculum} = await dataProvider.getOne("curriculum", {id: curriculumRecord.curriculum_id});
        curriculumRecord = curriculum;
    }
    const {data: curriculumLessons} = await dataProvider.getList("curriculum_lessons", {
        pagination: {page: 1, perPage: 10000},
        meta: {scopingEscapeHatch: true},
        filter: {curriculum_id: curriculumRecord.id},
    });
    const newCurriculum = {
        ...curriculumRecord,
        name: "Copy of " + curriculumRecord?.name,
    };
    delete newCurriculum.id;
    await dataProvider.create("curriculum", {data: newCurriculum}).then(({data}) => {
        const lessonPromises = curriculumLessons.map(lesson => {
            delete lesson.id;
            return dataProvider.create("curriculum_lessons", {
                data: {
                    ...lesson,
                    curriculum_id: data.id,
                }
            });
        });

        Promise.all(lessonPromises).then(() => {
            navigate(`/curriculum/${data.id}`);
        }).catch(error => {
            remoteLog("Error copying curriculum lessons: ", error);
        });
    })
}

export async function handleLessonDuplicate(dataProvider, record, navigation) {
    const newLesson = {
        ...record,
        name: "Copy of " + record?.name,
    }
    delete newLesson.id;
    await dataProvider.create("lessons", {data: newLesson}).then(({data}) => {
        navigation(`/lessons/${data.id}`);
    }).catch(error => {
        remoteLog("Error copying lesson: ", error);
    });
}