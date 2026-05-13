import { RESOURCE } from "../views/students"
import {beforeCreateStudentUserAndParentUser, populateMultipleUser, populateSingleUser} from "../backend/students.ts";

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
    beforeCreate: [beforeCreateStudentUserAndParentUser],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [(data) => {
        data.client_type = undefined;
        console.log("Before save: ", data);
        return data;
    }],
    afterRead: [],
    afterSave: [],
}