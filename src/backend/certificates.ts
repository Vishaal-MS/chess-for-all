import { remoteLog } from "@mahaswami/vc-frontend";

export async function getAllCertificates(dataProvider) {
    try {
        const {data: certificates} = await dataProvider.getList('certificates', {
            pagination: {page: 1, perPage: 1000},
        });
        return certificates;
    } catch (error) {
        remoteLog("Error sending on getAllCertificates: ", error);
    }
}

export async function getCertificatesByCoach(dataProvider, currentCoachId) {
    try {
        const {data: certificates} = await dataProvider.getList('certificates', {
            filter: {coach_id: currentCoachId},
            pagination: {page: 1, perPage: 1000},
        });
        return certificates;
    } catch (error) {
        remoteLog("Error sending on getCertificatesByCoach: ", error);
    }
}

export async function getAllTrophies(dataProvider) {
    try {
        const {data: certificates} = await dataProvider.getList('trophies', {
            pagination: {page: 1, perPage: 1000},
        });
        return certificates;
    } catch (error) {
        remoteLog("Error sending on getAllTrophies: ", error);
    }
}

export async function getTrophiesByCoach(dataProvider, currentCoachId) {
    try {
        const {data: certificates} = await dataProvider.getList('trophies', {
            filter: {coach_id: currentCoachId},
            pagination: {page: 1, perPage: 1000},
        });
        return certificates;
    } catch (error) {
        remoteLog("Error sending on getTrophiesByCoach: ", error);
    }
}

export async function getCertificatesByClient(dataProvider, clientId) {
    try {
        const {data: certificates} = await dataProvider.getList('certificates', {
            filter: {client_id: clientId},
            pagination: {page: 1, perPage: 1000},
        });
        return certificates;
    } catch (error) {
        remoteLog("Error sending on getCertificatesByClient: ", error);
    }
}

export async function getTrophiesByClient(dataProvider, clientId) {
    try {
        const {data: trophies} = await dataProvider.getList('trophies', {
            filter: {client_id: clientId},
            pagination: {page: 1, perPage: 1000},
        });
        return trophies;
    } catch (error) {
        remoteLog("Error sending on getTrophiesByClient: ", error);
    }
}