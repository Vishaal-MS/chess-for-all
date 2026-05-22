import { RESOURCE } from "../views/standard_sections"
import {addEscapeTenantScoping, sortByCode} from "../backend/common_logics.ts";

export const StandardSectionsLogic: any = {
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
    beforeGetList: [addEscapeTenantScoping, sortByCode],
    beforeGetMany: [addEscapeTenantScoping],
    beforeGetManyReference: [addEscapeTenantScoping],
    beforeGetOne: [addEscapeTenantScoping],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}