import { RESOURCE } from "../views/users"
import {
    addPasswordAuth,
    afterGetMultipleUser,
    afterGetOneUser,
    completeTenantSetup, mergeProfileOnRead,
    sendUserCreatedEmail, stripProfileFieldsBeforeSave, syncProfileAfterCreate, syncProfileAfterSave, updateClientEmail
} from "../backend/users.ts";

export const UsersLogic: any = {
    resource: RESOURCE,
    afterCreate: [addPasswordAuth, syncProfileAfterCreate, sendUserCreatedEmail, completeTenantSetup, afterGetOneUser],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [afterGetMultipleUser],
    afterGetMany: [afterGetMultipleUser],
    afterGetManyReference: [afterGetMultipleUser],
    afterGetOne: [afterGetOneUser],
    afterUpdate: [syncProfileAfterSave, afterGetOneUser],
    afterUpdateMany: [],
    beforeCreate: [],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [updateClientEmail],
    beforeUpdateMany: [],
    beforeSave: [stripProfileFieldsBeforeSave],
    afterRead: [mergeProfileOnRead],
    afterSave: [],
}
