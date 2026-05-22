import { RESOURCE } from "../views/tags"
import {addEscapeTenantScoping} from "../backend/common_logics.ts";

export const TagsLogic: any = {
    resource: RESOURCE,
    afterCreate: [],
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
    beforeGetList: [addEscapeTenantScoping],
    beforeGetMany: [addEscapeTenantScoping],
    beforeGetManyReference: [addEscapeTenantScoping],
    beforeGetOne: [addEscapeTenantScoping],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}