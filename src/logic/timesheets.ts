import { RESOURCE } from "../views/timesheets"
import {addDivisionId, getUserId, isDivisionCoach, isOrgCoach} from "../backend/common_logics.ts";
import {getLocalStorage} from "@mahaswami/vc-frontend";

export const TimesheetsLogic: any = {
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
    beforeCreate: [addDivisionId, beforeCreateTimesheet],
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

async function beforeCreateTimesheet(params: any) {
    params.data = {
        ...params.data,
        is_archived: false,
        created_date: new Date().toISOString(),
        coach_id: isOrgCoach() || isDivisionCoach() ? getLocalStorage("coach_id") : params.data.coach_id,
        created_by_user_id: getUserId(),
    };
    return params;
}
