import { remoteLog } from "@mahaswami/vc-frontend";
import { generateFileName, uploadFile } from "../utils";
import { Identifier } from "react-admin";

export const updateGameById = async (gameId: Identifier | undefined, game: any) => {
    try {
        if (!gameId) {
            console.warn("Game Id not found")
            return;
        }
        if (!game || Object.keys(game).length == 0) {
            console.warn("Nothing to update in the Game.");
            return;
        }
        const dataProvider = window.swanAppFunctions.dataProvider;
        await dataProvider.update("games", {
            id: gameId,
            data: game
        })
    } catch (error) {
        const message = `Error: update game with captured pgn: ${error.message}`
        console.error(message);
        remoteLog(message, error)
    }
}

export const createFileFromPGN = (pgn: string, gameId: any) => {
    const fileName = generateFileName(pgn, gameId);
    const blob = new Blob([pgn], {type: 'application/vnd.chess-pgn'});
    const file = new File([blob], `${fileName}`, {type: 'application/vnd.chess-pgn'});
    const blobUrl = URL.createObjectURL(blob);
    return { file, blobUrl };
}

export const createPGNFileAndUpdateGame = async (gameId: Identifier | undefined, pgn: string, payload : any) => {
    try {
        if (!gameId) {
            console.warn("Game Id not found")
            return;
        }
        if (!pgn) {
            console.warn("Please provide pgn to create pgn file for game.");
            return;
        }
        const dataProvider = window.swanAppFunctions.dataProvider;
        const fileName = generateFileName(pgn, gameId);
        const blob = new Blob([pgn], {type: 'application/vnd.chess-pgn'});
        const file = new File([blob], `${fileName}`, {type: 'application/vnd.chess-pgn'});
        const blobUrl = URL.createObjectURL(blob);
        await dataProvider.update("games", {
            id: gameId,
            data: {
                pgn_attachment_file_id: {
                    rawFile: file,
                    src: blobUrl,
                    title: file.name
                },
                ...payload,
            }
        })
    } catch (error) {
        const message = `Error: update game with played pgn: ${error}`
        console.log(message);
        remoteLog(message, error)
    }
}

export const initializeGame = async (params: any) => {
    try {
        const dataProvider = window.swanAppFunctions.dataProvider;
        const { data: timeControl } = await dataProvider.getOne("time_controls", { 
            id: params.data.time_control_id
        });
        params.data = {
            ...params.data,
            player1_time_number: timeControl.base_time_number * 1000,
            player2_time_number: timeControl.base_time_number * 1000,
        }
        return params;
    } catch (error) {
        remoteLog("Error: initialize game:", error)
    }
}

export const addPlayersFilter = async (params, dataProvider) => {
    let newParams = params || {};
    newParams.filter = {...newParams.filter};
    delete newParams?.filter?.players_filter_by_ids; // Remove the temp filter field from payload.
    return newParams;
};