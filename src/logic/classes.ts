import { RESOURCE } from "../views/classes"
import {
    deleteCascadeClass,
    filterByCoachId,
    filterByStatus,
    removeTotalClassesCountAtLogin
} from "../backend/classes.ts";
import {addDivisionId, filterByDivisionId} from "../backend/common_logics.ts";

export const ClassesLogic: any = {
    resource: RESOURCE,
    afterCreate: [],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [removeTotalClassesCountAtLogin],
    afterUpdateMany: [],
    beforeCreate: [addDivisionId],
    beforeDelete: [deleteCascadeClass],
    beforeDeleteMany: [],
    beforeGetList: [filterByStatus, filterByCoachId, filterByDivisionId],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [(data) => {
        data.teaching_mode = undefined;
        return data;
    }],
    afterRead: [],
    afterSave: [],
}