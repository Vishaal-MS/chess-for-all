import { remoteLog } from "@mahaswami/vc-frontend";

export async function getPaymentsForTenant(dataProvider) {
    try {
        const {data: payments} = await dataProvider.getList('payments', {
            pagination: {page: 1, perPage: 1000},
        });
        return payments;
    } catch (error) {
        remoteLog("Error sending on getPaymentsForTenant: ", error);
    }
}

export async function getPaymentsFromClient(dataProvider, clientId) {
    try {
        const {data: payments} = await dataProvider.getList('payments', {
            filter: {client_id: clientId}, sort: {field: 'id', order: 'DESC'},
            pagination: {page: 1, perPage: 1000},
        });
        return payments;
    } catch (error) {
        remoteLog("Error sending on getPaymentsFromClient: ", error);
    }
}