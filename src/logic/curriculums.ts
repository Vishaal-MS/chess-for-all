import { remoteLog } from "@mahaswami/vc-frontend";
import { RESOURCE, DETAIL_RESOURCES } from "../views/curriculums"

export const CurriculumsLogic: any = {
    resource: RESOURCE,
    afterCreate: [],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [(params: any) => {
        return params;
    }],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}

export const CurriculumLessonsLogic: any = {
    resource: DETAIL_RESOURCES[0],
    afterCreate: [],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [(params: any) => {
        return params;
    }],
    afterGetMany: [prefetchSubscribables],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [],
    beforeGetMany: [],
    beforeGetManyReference: [prefetchSubscribables],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}

async function prefetchSubscribables(result: any) {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        console.log("Result: ", result);
        const currLessonsLessonIds = result?.data?.map((currLesson: any) => currLesson.lesson_id);
        if (currLessonsLessonIds && currLessonsLessonIds.length > 0) {
            const { data: subscribables } = await dataProvider.getList("subscribables", {
                meta: { scopingEscapeHatch: true }
            });
            const subscribableCurrIds = subscribables.map((subscribable: any) => subscribable.curriculum_id);
            const {data: subscribedCurrLessons} = await dataProvider.getList("curriculum_lessons", {
                filter: { curriculum_id: subscribableCurrIds, lesson_id: currLessonsLessonIds },
                meta: { scopingEscapeHatch: true }
            });
            if (subscribedCurrLessons && subscribedCurrLessons.length > 0) {
                result.data = result.data.map((currLesson: any) => {
                    subscribableCurrIds.forEach((subscribableCurrId: any) => {
                        if (subscribedCurrLessons.some((scl: any) => scl.curriculum_id === subscribableCurrId && scl.lesson_id === currLesson.lesson_id)) {
                            currLesson.subscribable = subscribables.find((subscribable: any) => subscribable.curriculum_id === subscribableCurrId);
                        }
                    });
                    return currLesson;
                });
            }
        }
        return result;
    } catch (error) {
        console.error(`Error sending on prefetchSubscribable: ${error}`)
        remoteLog(`Error sending on prefetchSubscribable: ${error}`)
    }
}