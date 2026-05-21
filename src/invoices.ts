import { remoteLog } from "@mahaswami/vc-frontend";

export async function getInvoicesForTenantByStatus(dataProvider, status) {
    try {
        const {data: payments} = await dataProvider.getList('invoices', {
            filter: {status: status},
            pagination: {page: 1, perPage: 1000},
        });
        return payments;
    } catch (error) {
        remoteLog("Error sending on getInvoicesForTenantByStatus: ", error);
    }
}

export async function getPendingInvoicesFromClient(dataProvider, clientId) {
    try {
        const {data: invoices} = await dataProvider.getList('invoices', {
            filter: {status: "unpaid", client_id: clientId},
            pagination: {page: 1, perPage: 1000},
        });
        return invoices;
    } catch (error) {
        remoteLog("Error sending on getPendingInvoicesFromClient: ", error);
    }
}