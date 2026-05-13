import { GameEndResult } from "../../helpers/constants";

export const getGamePGN = () => {
    if (window.glApp) {
        const module = window.glApp.panelMgr.modules?.[0]
        const kernelGame = module.getKernel?.()?.game;
        return PGNWriter.toPGN(kernelGame);
    }
    return ""
}

export const parseGameFromPgnStr = (pgn: any) => {
    if (!pgn) return null;
    const game = PGN?.parseGame(pgn);
    return game;
}

type HeaderType = {
    player1: string;
    player2: string;
    eventName: string;
    eventDate: string;
    timeControl: { baseTime?: number; increment?: number };
    result: string;
}

export const extractDetailsFromPGNStr = (pgn: string): HeaderType | null => {
    if (!pgn) return null;
    const pgnGame = parseGameFromPgnStr(pgn);
    if (!pgnGame) {
        console.warn("Failed to parse PGN: ", pgn);
        return null;
    }
    const gameHeader = pgnGame.getHeader();
    const whitePlayer = gameHeader.white
    const blackPlayer = gameHeader.black
    const eventName = gameHeader.getEvent()
    const eventDate = gameHeader.getDateStr()
    const timeControl = { baseTime: gameHeader.clockParams?.startMins * 60 || 0, increment: gameHeader.clockParams?.incSecs || 0 };
    // NOTE: Result will return a number
    // -1 = Game Unfinished
    //  0 = Black wins
    //  1 = Draw
    //  2 = White Wins
    //  3 = Game Unfinished
    const result = gameHeader.getResult() + "";
    const player1 = (whitePlayer.first + " " + whitePlayer.last).trim();
    const player2 = (blackPlayer.first + " " + blackPlayer.last).trim();
    return {
        player1,
        player2,
        eventName,
        eventDate,
        timeControl,
        result
    }
}


export const handleGamePgnUpdate = (name: string, value: any) => {
    const header = window.glApp.panelMgr.modules?.[0]?.getKernel?.()?.game?.getHeader();
    if (!header) return;
    if (name === "player1_name") {
        header.setWhite(PGN.checkUndefined(value));
    } else if (name === "player2_name") {
        header.setBlack(PGN.checkUndefined(value));
    } else if (name === "event") {
        header.setEvent(PGN.checkUndefined(value));
    } else if (name === "event_date") {
        const date = new Date(value);
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        PGN.isDefined(formattedDate) && header.setDateStr(formattedDate);
    } else if (name === "time_control") {
        PGN.isDefined(value) && header.setClockParams(PGN.toClockParams(value));
    } else if (name === "site") {
        PGN.isDefined(value) && header.setSite(value);
    }
};

export const scrollToMove = (block: ScrollLogicalPosition, moveIndex: number) => {
    const tableContainer = document.querySelector('.notation-table-container') as HTMLElement | null;
    if (tableContainer) {
        const row = tableContainer.querySelector(`[data-move-index="${moveIndex}"]`) as HTMLElement | null;
        if (row) {
            // Distance of row inside the container
            const offset = row.offsetTop - tableContainer.offsetTop;
            let targetScroll = tableContainer.scrollTop;

            if (block === "center") {
                targetScroll = offset - tableContainer.clientHeight / 2 + row.clientHeight / 2;
            } else if (block === "start") {
                targetScroll = offset;
            } else if (block === "end") {
                targetScroll = offset - tableContainer.clientHeight + row.clientHeight;
            }

            tableContainer.scrollTo({
                top: targetScroll,
                behavior: "smooth"
            });
        }
    }
};

export const readPGNFromFile = (File: File): PromiseLike<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const pgn = e.target?.result as string;
                resolve(pgn);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsText(File);
    });
};

export const applyResult = (resultStr: string) => {
    let result= GameResultEnum.DRAW;
    const kernel = window.glApp.panelMgr.modules[0].getKernel();
    if (resultStr === "black_wins") {
        result = GameResultEnum.BLACK_WINS;
    } else if (resultStr === "white_wins") {
        result = GameResultEnum.WHITE_WINS;
    }
    kernel.setResult(result, ResultFlags.NONE);
};

export const getGameResult = (result: number) => {
    return result === 2 
        ? GameEndResult.WHITE_WON : result == 0
        ? GameEndResult.BLACK_WON : GameEndResult.DRAW;
}

export const initializeBotGameBoardAndBot = (record: Record<any, any>) => {
    // update PGN header tags
    updateGameHeader(record);
    const pgnGame = parseGameFromPgnStr(getGamePGN());
    const kernel = window.glApp.panelMgr.modules[0].getKernel();
    kernel.game.assign(pgnGame);
    setTimeout(() => {
        if (record?.player2_student_id) {
            // Change the bot side, flip board and trigger bot.
            flipGameBoard(); // Flip the Board.
            window.glApp.panelMgr.modules[0].getKernel().Vp.engineSide = Side.WHITE; // Engine side change to white.
            setTimeout(() => {
                window.glApp.panelMgr.modules[0].getKernel().Vp.engineGo(0); // Engine makes first move.
            }, 0)
        }
    }, 0); // TODO: With out differ it didn't work.
};

export const flipGameBoard = () => {
    window?.glApp?.panelMgr?.fnFlipBoard(0); // Flip the Board.
};

export const updateGameHeader = (record: Record<any, any>) => {
    handleGamePgnUpdate("player1_name", record.player1_name);
    handleGamePgnUpdate("player2_name", record.player2_name);
    handleGamePgnUpdate("event", record.event);
    handleGamePgnUpdate("event_date", record.event_date);
    handleGamePgnUpdate("site", location.host);
    const {base_time_number, increment_time_number} = record?.time_control;
    handleGamePgnUpdate("time_control", `${base_time_number}+${increment_time_number}`);
}

export const updateResultForPGN = (pgn: string, result: string) => {
    const pgnGame = parseGameFromPgnStr(pgn);
    pgnGame.hdr.setResult(parseInt(result));
    return PGNWriter.toPGN(pgnGame);
}

export const disableBoard = () => {
    try {
        window.glApp.panelMgr.modules[0].getKernel().boardWin.allowInput = false;
    } catch (error) {
        console.error("Error while disable game board:", error);
    }
};
