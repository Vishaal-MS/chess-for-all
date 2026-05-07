import { RESOURCE } from "../views/enrollments"
import {
    addBusinessLogicForEnrollments, afterCreateEnrollments,
    afterDeleteEnrollements, updateUsersInActiveStatusByDeleteEnrollments
} from "../backend/enrollments.ts";

export const EnrollmentsLogic: any = {
    resource: RESOURCE,
    afterCreate: [afterCreateEnrollments],
    afterDelete: [updateUsersInActiveStatusByDeleteEnrollments, afterDeleteEnrollements],
    afterDeleteMany: [],
    afterGetList: [],
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
    afterSave: [addBusinessLogicForEnrollments],
}