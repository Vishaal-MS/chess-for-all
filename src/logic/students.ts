import { RESOURCE } from "../views/students"
import {
    beforeCreateStudentUserAndParentUser,
    beforeUpdateStudent,
    populateMultipleUser,
    populateSingleUser
} from "../backend/students.ts";
import {addDivisionId, filterByDivisionId} from "../backend/common_logics.ts";

export const StudentsLogic: any = {
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
    beforeCreate: [addDivisionId, beforeCreateStudentUserAndParentUser],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [filterByDivisionId],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [beforeUpdateStudent],
    beforeUpdateMany: [],
    beforeSave: [(data) => {
        data.client_type = undefined;
        return data;
    }],
    afterRead: [],
    afterSave: [],
}