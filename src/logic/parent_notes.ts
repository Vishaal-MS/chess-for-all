import { RESOURCE } from "../views/parent_notes"
import {sendEmailToParentAfterCreateNote} from "../backend/users.ts";

export const ParentNotesLogic: any = {
    resource: RESOURCE,
    afterCreate: [sendEmailToParentAfterCreateNote],
    afterDelete: [],
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
    afterSave: [],
}