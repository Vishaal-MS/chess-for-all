import {remoteLog} from "@mahaswami/vc-frontend";
import {currentTenantId, getDivisionId, isLargeAcademy} from "../businessLogic.ts";

export const updateLessonBlockMappings = async (record, dataProvider, resource) => {
    try {
        const lessonId = record.id;
        const {data: lesson_block_mappings} = await dataProvider.getList('lesson_block_mapping', {
            filter: {lesson_id: lessonId},
            pagination: { page: 1, perPage: 1000 },
        });
        const lesson_content = record.content;
        const regex = /lesson_block_id="(\d+)"/g;
        const lessonBlockIds = [];
        let match;

        while ((match = regex.exec(lesson_content)) !== null) {
            lessonBlockIds.push(parseInt(match[1]));
        }
        //Delete the mappings for deleted lesson blocks
        for (const lesson_block_mapping of lesson_block_mappings) {
            if( !lessonBlockIds.includes(lesson_block_mapping.id)) {
                await dataProvider.delete('lesson_block_mapping', {id: lesson_block_mapping.id});
            }
        }
        //Add missing lesson block mappings
        for (const lessonBlockId of lessonBlockIds) {
            const lessonBlock = lesson_block_mappings.find(lesson_block => lesson_block.id.toString() === lessonBlockId);
            if(!lessonBlock) {
                await dataProvider.create('lesson_block_mapping', {data: {lesson_id: lessonId,lesson_block_id: lessonBlockId, tenant_id: currentTenantId()}});
            }
        };
        return record;
    } catch (error) {
        remoteLog("Error sending on updateLessonBlockMappings: ", error);
    }
}

export const filterByDivisionId = async (params, dataProvider) => {
    let newParams = params;
    if(!newParams) {
        newParams = {};
    }
    if (!isLargeAcademy()) return newParams;
    if (newParams.meta?.scopingEscapeDivision) return newParams;
    const divisionId = await getDivisionId();
    newParams.filter = {...newParams.filter, division_id: divisionId};
    return newParams;
}