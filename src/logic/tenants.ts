import {TenantConfigNames} from "../helpers/constants.ts";
import {remoteLog} from "@mahaswami/vc-frontend";

export const TenantsLogic: any = {
    resource: 'tenants',
    afterCreate: [addTenantSetting],
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

async function addTenantSetting(response, dataProvider, resource) {
    try {
        const tenant = response.data;

        const settings = [
            {tenant_id: tenant.id, config_name: TenantConfigNames.ALLOW_COACHING, config_value: 'TRUE'},
            {tenant_id: tenant.id, config_name: TenantConfigNames.ALLOW_PUBLISHING, config_value: 'FALSE'},
            {tenant_id: tenant.id, config_name: TenantConfigNames.TENANT_TYPE, config_value: '1'},
            {tenant_id: tenant.id, config_name: TenantConfigNames.COUNTRY, config_value: ''},
            {tenant_id: tenant.id, config_name: TenantConfigNames.LARGE_ACADEMY, config_value: 'FALSE'},
            {tenant_id: tenant.id, config_name: TenantConfigNames.REGULAR_SCHOOL_FLAVORED, config_value: 'FALSE'},
            {tenant_id: tenant.id, config_name: TenantConfigNames.EXECUTIVE_COACHING_FLAVORED, config_value: 'FALSE'},
            {tenant_id: tenant.id, config_name: TenantConfigNames.SCHOOL_STANDARD_LINKED, config_value: 'FALSE'},
            {tenant_id: tenant.id, config_name: TenantConfigNames.SCHOOL_STANDARD_ID, config_value: ''},
            {tenant_id: tenant.id, config_name: TenantConfigNames.ALLOW_VOICE_OVER, config_value: 'FALSE'}
        ];

        await Promise.all(
            settings.map(data =>
                dataProvider.create("settings", {data: data})
            )
        );

    } catch (error) {
        console.error("Error while adding tenant setting: ", error);
        remoteLog("Error sending on addTenantSetting: ", error);
    } finally {
        return response;
    }
}
