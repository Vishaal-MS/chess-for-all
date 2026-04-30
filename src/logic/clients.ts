import {afterCreateClient, afterGetOneClient, beforeUpdateClient} from "../backend/clients.ts";
import {populateStudentForIndividualClient} from "../backend/students.ts";

export const ClientsLogic: any = {
    resource: 'clients',
    afterCreate: [afterCreateClient],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [(params: any) => {
        return params;
    }],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [afterGetOneClient],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [formatDataAndMeta],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [populateStudentForIndividualClient],
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
    return { data, meta };
}