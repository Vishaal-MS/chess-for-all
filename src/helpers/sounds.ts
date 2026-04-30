import {Howl, Howler} from 'howler';
import {getLocalStorage, removeLocalStorage} from "@mahaswami/vc-frontend";
import {getFileDownloadURL} from "../utils";

export const isSoundEnabled = (): boolean => {
    const isAppSoundEnabled = getLocalStorage("is_app_sound_enabled");
    const gameSound = getLocalStorage("is_game_sound_enabled");

    const isGameSoundEmpty = gameSound === null || gameSound === undefined;
    if (isAppSoundEnabled && (isGameSoundEmpty || gameSound === true)) {
        return true;
    }
    return false;
}

export const isAppSoundEnabled = (): boolean => {
    const isAppSoundEnabled = getLocalStorage("is_app_sound_enabled");
    return isAppSoundEnabled == true || isAppSoundEnabled === "true";
}

// This function is used to set the game sound.
export const handleEnableGameSound = () => {
    const isAudioEnabled = isSoundEnabled();
    glApp?.chessAudio?.enable(isAudioEnabled);
}

export const handleMuteHowler = (value : boolean) => {
    Howler?.mute(value);
}

export const removeGameSoundFromLocalStorage = () => {
    removeLocalStorage("is_game_sound_enabled");
}

export const origin = window.location.origin;
export const soundBaseUrl = `${origin}/assets/v1/chess_sounds/`;

export const playBlockCompleteSound = () => {
    if (!isSoundEnabled()) {
        return;
    }
    const sound = new Howl({
        src: [soundBaseUrl + 'success.mp3'],
        volume: 0.3
    });
    sound.play();
}
export const getBgMusicHowler = (fileId: number) => {
    if (!isAppSoundEnabled()) return null;
    const bgMusicUrl = getFileDownloadURL(fileId);
    const sound = new Howl({
        src: [bgMusicUrl],
        volume: 0.1,
        loop: true,
        html5: true,
        preload: true,
        format: ['mp3'],
        onplayerror: () => {
            sound.on("unlock", () => {
                sound.play();
            });
        }
    });
    return sound;
};


export const playAssignmentCompleteSound = () => {
    if (!isSoundEnabled()) {
        return;
    }
    const sound = new Howl({
        volume: 0.3,
        src: [soundBaseUrl + 'clapping.mp3']
    });
    sound.play();
}

export const createHowlerInstance = (soundFileURL, soundSprites) => {
    let sprite;
    if (typeof soundSprites === 'string') {
        sprite = JSON.parse(soundSprites);
    } else {
        sprite = soundSprites;
    }
    
    return new Howl({
        src: [soundFileURL],
        format: ['mp3'], // Because of using blob url we need to specify format exlicitly
        sprite
    })
}
let currentPlayingSoundId: number | null = null;

export const playVoiceOverClip = (howler: any, clip: string) => {
    if (!howler || !clip) return; 
    // Stop previously playing clip if any
    if (currentPlayingSoundId !== null) {
        howler.stop(currentPlayingSoundId);
        currentPlayingSoundId = null;
    }

    // Play new clip
    currentPlayingSoundId = howler.play(clip);
}