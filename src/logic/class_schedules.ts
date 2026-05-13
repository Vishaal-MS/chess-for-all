import { RESOURCE } from "../views/class_schedules"
import {afterDeleteSchedule, afterUpdateClassSchedule, beforeCreateClassSchedule} from "../backend/classSchedule.ts";

export const ClassSchedulesLogic: any = {
    resource: RESOURCE,
    afterCreate: [],
    afterDelete: [afterDeleteSchedule],
    afterDeleteMany: [],
    afterGetList: [],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [afterUpdateClassSchedule],
    afterUpdateMany: [],
    beforeCreate: [beforeCreateClassSchedule],
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