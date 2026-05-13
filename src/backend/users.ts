import {getLocalStorage, remoteLog} from "@mahaswami/vc-frontend";
import {TenantConfigNames, TenantTypes, UserRoles, UserStatus} from "../helpers/constants.ts";
import {getRole, sendEmail} from "../businessLogic.ts";
import {getCoachEmailTemplate} from "../helpers/emailTemplates.ts";
import {isDateExpired} from "../utils.ts";

export const createUser = async (userDetails: any) => {
    try {
        console.log("createUser start: ", userDetails)
        userDetails.email = userDetails?.email?.toLowerCase();
        const dataProvider = window.swanAppFunctions.dataProvider;
        console.log("userDetails: ", userDetails)
        const { data: userData } = await dataProvider.create('users', {
            data: {
                ...userDetails,
                creation_date: new Date(),
            }
        });
        console.log("userData: ", userData)
        return userData;
    } catch (error) {
        remoteLog("Error sending on createUser: ", error);
    }
}

export const getStatusForUser = (user: any) => {
    let userStatus;
    const lastLoginDate = user.last_login_date;
    if (user.is_active && lastLoginDate) {
        userStatus = UserStatus.ACTIVE;
    } else if (user.is_active && !lastLoginDate || !user.is_active && !lastLoginDate) {
        userStatus = UserStatus.PENDING;
    } else {
        userStatus = UserStatus.INACTIVE;
    }
    return userStatus;
}

export const afterGetMultipleUser = (result) => {
    result.data = result.data.map(user => {
        user.fullName = `${user.first_name} ${user.last_name}`;
        user.status = getStatusForUser(user);
        return user;
    });
    return result;
}


export const afterGetOneUser = (result) => {
    const temp = afterGetMultipleUser({data: [result.data]});
    return {data: temp.data[0] }
}

export const completeTenantSetup = async (response, dataProvider, resource) => {
    try {
        const user = response.data;
        const {data: coachList} = await dataProvider.getList("coaches", {
            filter: {tenant_id: user.tenant_id},
            perPage: 1000
        });
        if (coachList.length === 0) {
            await dataProvider.create("coaches", {
                data: {
                    user_id: user.id,
                    tenant_id: user.tenant_id
                }
            });
            // Add Build-in Subscriptions
            await addBuiltInSubscriptionsForTenant(user.tenant_id, dataProvider);
        }
    } catch (error) {
        console.error("Error while creating the coach : ", error);
        remoteLog("Error sending on completeTenantSetup: ", error);
    } finally {
        return response;
    }
}

const getConfigValue = (settings: any[], configName: string) => {
    return settings.find(s => s.config_name === configName)?.config_value;
};

const addBuiltInSubscriptionsForTenant = async (userTenantId: number, dataProvider: any) => {
    try {
        const superAdminTenantId = getLocalStorage("tenant_id");
        const { data: settings } = await dataProvider.getList("settings", {
            filter: { tenant_id: [superAdminTenantId, userTenantId] }
        });

        const tenantTypeId = getConfigValue(settings, TenantConfigNames.TENANT_TYPE);
        const { data: tenantType } = await dataProvider.getOne("academy_types", {
            id: tenantTypeId
        });

        let buildInSubscriptions = "";

        if (tenantType?.name === TenantTypes.PRO_COACH) {
            buildInSubscriptions = getConfigValue(settings, TenantConfigNames.PRO_COACH_BUILD_IN_SUBSCRIPTIONS);
        } else if (tenantType?.name === TenantTypes.COACHING_ORG) {
            const largeAcademyValue = getConfigValue(settings, TenantConfigNames.LARGE_ACADEMY);
            const isLargeAcademy = largeAcademyValue.toUpperCase() === 'TRUE';
            if (isLargeAcademy) {
                buildInSubscriptions = getConfigValue(settings, TenantConfigNames.LARGE_ACADEMY_BUILD_IN_SUBSCRIPTIONS);
            } else {
                buildInSubscriptions = getConfigValue(settings, TenantConfigNames.ACADEMY_BUILD_IN_SUBSCRIPTIONS);
            }
        }

        if (!buildInSubscriptions) {
            return;
        }

        const curriculumIds: number[] = buildInSubscriptions.split(",")
            .map(id => Number(id.trim()))
            .filter(id => !isNaN(id));

        if (curriculumIds.length === 0) {
            return;
        }

        const currentDate = new Date();
        const { data: subscribables } = await dataProvider.getList("subscribables", {
            filter: { curriculum_id: curriculumIds },
            meta: { scopingEscapeHatch: true }
        });

        await Promise.all(
            subscribables.map(subscribable => [
                dataProvider.create("subscribers", {
                    data: {
                        start_date: currentDate,
                        end_date: '12/31/2029',
                        subscribable_id: subscribable?.id,
                        subscriber_tenant_id: userTenantId,
                        tenant_id: subscribable?.publisher_tenant_id
                    }
                }),
                dataProvider.create("subscriptions", {
                    data: {
                        start_date: currentDate,
                        end_date: '12/31/2029',
                        subscribable_id: subscribable?.id,
                        subscriber_tenant_id: userTenantId,
                        tenant_id: userTenantId
                    }
                })
            ])
        );
    } catch (error) {
        remoteLog("Error sending on addBuiltInSubscriptionsForTenant: ", error);
    }
};

export const addPasswordAuth = async (result: any) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const userData = result.data;
        await dataProvider.create('password_auths', {
            data: {
                user_id: userData.id,
                password_hash: "",
            }
        });
    } catch (error) {
        console.error(`Error addind dummy user: ${error}`);
    } finally {
        return result;
    }
}

export const sendUserCreatedEmail = async (response, dataProvider, resource) => {
    try {
        if (getRole() === UserRoles.SUPER_ADMIN) return response;
        const userEmail = response.data.email;
        if (response.data.role !== UserRoles.STUDENT && response.data.role !== UserRoles.PARENT) {
            const messageTemplate = await getCoachEmailTemplate(response.data);
            await sendEmail({
                to: userEmail,
                ...messageTemplate
            })
        }
    } catch (error) {
        console.error("Error sending email: ", error);
        remoteLog("Error sending user creation email:", error)
    } finally {
        return response;
    }
}

export const updateClientEmail = async (params: any, dataProvider: any) => {
    const userData = params.data;
    const previousUserData = params.previousData;
    if (userData.role === UserRoles.STUDENT && getRole() === UserRoles.SUPER_ADMIN) {
        if (userData.email !== previousUserData.email) {
            const {data: students} = await dataProvider.getList("students", {
                filter: {user_id: userData?.id},
                meta: {prefetch: ["clients"]}
            });
            const client = students[0]?.client;
            await dataProvider.update("clients", {id: client.id, data: {...client, email: userData.email}});
        }
    }

    // TODO: Later this reset logic moved to backend auth service. this is temp fix.
    // Reset the lastLoginDate if use is 90 days inactive.
    if (userData) {
        if (userData?.is_active === true) {
            const currentDate = new Date();
            const lastLoginDate = userData?.last_login_date || currentDate;
            const isExpired = isDateExpired(lastLoginDate, 90); //maximum inactive days = 90
            if (isExpired) {
                return {
                    ...params,
                    data: {
                        ...userData,
                        last_login_date: currentDate,
                    },
                }
            }
        }
    }
    return params;
}
let _pendingProfileData: Record<string, any> | null = null;

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

export const isAdminWithAccess = () => {
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

export const mergeProfileOnRead = async (record: any, dataProvider: any) => {
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

export const STRIP_ON_SAVE = [...PROFILE_FIELDS, 'fullName'];

export const stripProfileFieldsBeforeSave = (data: any) => {
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

export const syncProfileAfterCreate = async (result: any, dataProvider: any) => {
    if (_pendingProfileData?.auth_policy_id) _pendingProfileData.setup_token = 'create';
    return syncProfileAfterSave(result, dataProvider);
};

export const syncProfileAfterSave = async (result: any, dataProvider: any) => {
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