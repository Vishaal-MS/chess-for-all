import {afterCreateClient, afterGetOneClient, beforeUpdateClient} from "../backend/clients.ts";
import {populateStudentForIndividualClient} from "../backend/students.ts";
import {addDivisionId, filterByDivisionId} from "../backend/common_logics.ts";

export const ClientsLogic: any = {
    resource: 'clients',
    afterCreate: [afterCreateClient],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [populateStudentForIndividualClient],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [afterGetOneClient],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [formatDataAndMeta, addDivisionId],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [filterByDivisionId],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [beforeUpdateClient],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}

async function formatDataAndMeta(params: any) {
    const { data, meta } = params?.data;
    console.log("Client before create: ", data, meta)
    return { data, meta };
}