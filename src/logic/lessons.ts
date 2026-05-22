import { RESOURCE } from "../views/lessons"
import {updateLessonBlockMappings} from "../backend/lessons.ts";
import {addDivisionId, filterByDivisionId} from "../backend/common_logics.ts";

export const LessonsLogic: any = {
    resource: RESOURCE,
    afterCreate: [],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [filterByDivisionId],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [addDivisionId],
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
    afterSave: [updateLessonBlockMappings],
}