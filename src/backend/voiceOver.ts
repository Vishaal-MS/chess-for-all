import { remoteLog } from "@mahaswami/vc-frontend";
import JSZip from "jszip";
import { getSettingsBasedOnEnv } from "../configuration";

type VoiceResult = { 
    status: number, 
    audioBlob?: Blob, 
    sprites?: string, 
    error?: string, 
    message?: string 
}

// This is for Reference of voice setting config in elevenlabs.
// @ts-ignore
type ReferenceVoiceSettings = {
    /** Determines how stable the voice is and the randomness between each generation. Lower values introduce broader emotional range for the voice. Higher values can result in a monotonous voice with limited emotion. */
    stability?: number;
    /** This setting boosts the similarity to the original speaker. Using this setting requires a slightly higher computational load, which in turn increases latency. */
    useSpeakerBoost?: boolean;
    /** Determines how closely the AI should adhere to the original voice when attempting to replicate it. */
    similarityBoost?: number;
    /** Determines the style exaggeration of the voice. This setting attempts to amplify the style of the original speaker. It does consume additional computational resources and might increase latency if set to anything other than 0. */
    style?: number;
    /** Adjusts the speed of the voice. A value of 1.0 is the default speed, while values less than 1.0 slow down the speech, and values greater than 1.0 speed it up. */
    speed?: number;
}


export async function generateVoiceOverMessages(messages: Record<string, string>, voiceId: string = "19STyYD15bswVz51nqLf"): Promise<VoiceResult | undefined> {
    try {
        let formatedMessages = Object.entries(messages).map(([key, value]) => ({ name: value, text: key }));
        const appConfigSetting = getSettingsBasedOnEnv();
        const VOICEOVER_SERVICE_URL = appConfigSetting.voiceover_service_url;
        const { service_api_key, ...elevenLabsConfig } = appConfigSetting.voiceover_config;

        const response = await fetch(`${VOICEOVER_SERVICE_URL}/api/voice-over`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": service_api_key
            },
            body: JSON.stringify({ 
                messages: formatedMessages, 
                elevenlabs: { voiceId, ...elevenLabsConfig }
            })
        })
        if (!response.ok) {
            const errorResponse = await response.json();
            return {
                status: 400,
                error: errorResponse.status,
                message: errorResponse.message
            }
        }
        const blob = await response.blob();
        const zip = new JSZip();
        const audioResult = await zip.loadAsync(blob, { base64: true });
        const files = audioResult.files;
        let voiceResult: VoiceResult = { status: 200 };
        if (files) {
            const audioZipObject = files["output.mp3"];
            if (audioZipObject) {
                const audioFileBlob = await audioZipObject.async("blob");
                voiceResult.audioBlob = audioFileBlob;
            } else {
                console.warn("Audio file 'output.mp3' not found in the zip.");
            }
            const jsonZipObject = files["output.json"];
            if (jsonZipObject) {
                const jsonString = await jsonZipObject.async("string"); // Extract JSON content as a string
                const jsonData = JSON.parse(jsonString);
                if (jsonData && jsonData.sprite) {
                    voiceResult.sprites = JSON.stringify(jsonData.sprite);
                }
            } else {
                console.warn("JSON file 'output.json' not found in the zip.");
            }
            
        }
        return voiceResult;
    } catch (error) {
        remoteLog(`Error while handleGenerateVoice: ${error}`)
        console.error(`Error while handleGenerateVoice: ${error}`)
    }
}

// clear cache
export async function clearVoiceOverCache(texts: string[], voiceId: string = "19STyYD15bswVz51nqLf"): Promise<VoiceResult | undefined> {
    try {
        const appConfigSetting = getSettingsBasedOnEnv();
        const VOICEOVER_SERVICE_URL = appConfigSetting.voiceover_service_url;
        const { service_api_key } = appConfigSetting.voiceover_config;

        const response = await fetch(`${VOICEOVER_SERVICE_URL}/api/voice-over/clear-cache`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": service_api_key
            },
            body: JSON.stringify({ texts, voiceId })
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
        return { status: 200 };
    } catch (error) {
        remoteLog(`Error while clearing voice over cache: ${error}`);
        console.error(`Error while clearing voice over cache: ${error}`);
    }
}