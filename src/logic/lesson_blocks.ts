import { RESOURCE } from "../views/lesson_blocks"
import {getLocalStorage} from "@mahaswami/vc-frontend";
import {getDivisionId} from "../businessLogic.ts";

export const isLargeAcademy = () => {
    const largeAcademy = getLocalStorage("tenant_large_academy");
    return largeAcademy?.toUpperCase() === 'TRUE';
}

const addDivisionId = (params, dataProvider) => {
    if (isLargeAcademy()) {
        params.data = {...params.data, division_id: getDivisionId()};
    } else {
        params.data = {...params.data, division_id: null};
    }
    return params;
}

const filterByDivisionId = async (params, dataProvider) => {
    let newParams = params;
    if(!newParams) {
        newParams = {};
    }
    if (!isLargeAcademy()) return newParams;
    if (newParams.meta?.scopingEscapeDivision) return newParams;
    const divisionId = await getDivisionId();
    newParams.filter = {...newParams.filter, division_id: divisionId};
    return newParams;
}

export const LessonBlocksLogic: any = {
    resource: RESOURCE,
    afterCreate: [],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [(params: any) => {
        return params;
    }],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [addDivisionId],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [filterByDivisionId],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}