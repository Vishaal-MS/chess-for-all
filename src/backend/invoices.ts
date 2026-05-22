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