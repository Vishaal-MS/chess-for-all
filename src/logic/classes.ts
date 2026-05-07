import { RESOURCE } from "../views/classes"
import {
    deleteCascadeClass,
    filterByCoachId,
    filterByStatus,
    removeTotalClassesCountAtLogin
} from "../backend/classes.ts";

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
    beforeCreate: [],
    beforeDelete: [deleteCascadeClass],
    beforeDeleteMany: [],
    beforeGetList: [filterByStatus, filterByCoachId],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}