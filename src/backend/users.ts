import { remoteLog } from "@mahaswami/vc-frontend";

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