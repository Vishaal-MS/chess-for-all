import {remoteLog} from "@mahaswami/vc-frontend";
import {getSettingsBasedOnEnv} from "../configuration";
import { getUserEmail } from "../businessLogic";

export async function scanScoreSheet(scorecardBase64: string) {
    try {
        const appConfigSetting = getSettingsBasedOnEnv();
        const VOICEOVER_SERVICE_URL = appConfigSetting.voiceover_service_url;
        const {service_api_key} = appConfigSetting.voiceover_config;

        const response = await fetch(`${VOICEOVER_SERVICE_URL}/api/games/scan-score-sheet`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": service_api_key
            },
            body: JSON.stringify({
                scorecardBase64: scorecardBase64,
                userEmail: getUserEmail()
            })
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            return {
                status: 400,
                error: errorResponse.status,
                message: errorResponse.message
            };
        }
        const result = await response.json();
        if (result.status == "partial") {
            return {
                status: 206,
                ...result
            };
        }
        return {status: 200, ...result};
    } catch (error) {
        remoteLog(`Error while scan score sheet: ${error}`);
        console.error(`Error while scan score sheet: ${error}`);
    }
}