import { RESOURCE } from "../views/users"
import { getLocalStorage } from "@mahaswami/vc-frontend"

const PROFILE_FIELDS = [
    'auth_policy_id',
    'is_password_enrolled',
    'is_authenticator_enrolled',
    'is_passkey_enrolled',
    'primary_method',
    'recovery_codes_remaining_count',
    'failed_login_attempts_count',
    'last_login_date',
    'creation_ip_address',
    'creation_location',
];

const WRITABLE_PROFILE_FIELDS = ['auth_policy_id'];

const isAdminWithAccess = () => {
    const role = getLocalStorage('role');
    if (role !== 'admin' && role !== 'super_admin') return false;
    try {
        const raw = sessionStorage.getItem('step_up_grant:settings');
        if (raw && new Date(JSON.parse(raw).expires_at) > new Date()) return true;
    } catch {}
    const session = getLocalStorage('session_policy');
    if (session) {
        try {
            const policy = typeof session === 'string' ? JSON.parse(session) : session;
            if (!policy.require_reauth_for_settings) return true;
        } catch {}
    }
    return false;
};

let _pendingProfileData: Record<string, any> | null = null;

const mergeProfileOnRead = async (record: any, dataProvider: any) => {
    if (!isAdminWithAccess()) return record;
    try {
        const { data } = await dataProvider.getList('user_security_profiles', {
            filter: { user_id: record.id },
            pagination: { page: 1, perPage: 1 },
            sort: { field: 'id', order: 'ASC' },
        });
        if (data?.[0]) {
            for (const field of PROFILE_FIELDS) {
                if (data[0][field] !== undefined) record[field] = data[0][field];
            }
        }
    } catch { /* profile may not exist yet */ }
    return record;
};

const STRIP_ON_SAVE = [...PROFILE_FIELDS, 'fullName'];

const stripProfileFieldsBeforeSave = (data: any) => {
    if (!isAdminWithAccess()) return data;
    _pendingProfileData = {};
    const cleaned = { ...data };
    for (const field of WRITABLE_PROFILE_FIELDS) {
        if (field in cleaned) {
            _pendingProfileData[field] = cleaned[field] ?? null;
        }
    }
    if (Object.keys(_pendingProfileData).length === 0) _pendingProfileData = null;
    for (const field of STRIP_ON_SAVE) {
        delete cleaned[field];
    }
    return cleaned;
};

const syncProfileAfterCreate = async (result: any, dataProvider: any) => {
    if (_pendingProfileData?.auth_policy_id) _pendingProfileData.setup_token = 'create';
    return syncProfileAfterSave(result, dataProvider);
};

const syncProfileAfterSave = async (result: any, dataProvider: any) => {
    if (!isAdminWithAccess() || !_pendingProfileData) return result;
    const userId = result.data?.id ?? result.id;
    if (!userId) return result;
    try {
        const { data } = await dataProvider.getList('user_security_profiles', {
            filter: { user_id: userId },
            pagination: { page: 1, perPage: 1 },
            sort: { field: 'id', order: 'ASC' },
        });
        if (data?.[0]) {
            await dataProvider.update('user_security_profiles', {
                id: data[0].id,
                data: _pendingProfileData,
                previousData: data[0],
            });
        }
    } catch (e) {
        console.error('[UsersLogic] Failed to sync profile fields:', e);
    } finally {
        _pendingProfileData = null;
    }
    return result;
};

export const UsersLogic: any = {
    resource: RESOURCE,
    afterCreate: [syncProfileAfterCreate],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [syncProfileAfterSave],
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
    beforeSave: [stripProfileFieldsBeforeSave],
    afterRead: [mergeProfileOnRead],
    afterSave: [],
}
