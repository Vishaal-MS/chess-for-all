import { RESOURCE } from "../views/coaches"
import {
    addDivisionIdForCoach,
    addUserForCoach,
    beforeUpdateCoach,
    filterCoachesAndAdminsByDivisionId
} from "../backend/coaches.ts";
import {populateMultipleUser, populateSingleUser} from "../backend/students.ts";

export const CoachesLogic: any = {
    resource: RESOURCE,
    afterCreate: [],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [populateMultipleUser],
    afterGetMany: [populateMultipleUser],
    afterGetManyReference: [],
    afterGetOne: [populateSingleUser],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [addDivisionIdForCoach, addUserForCoach],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [filterCoachesAndAdminsByDivisionId],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [beforeUpdateCoach],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}