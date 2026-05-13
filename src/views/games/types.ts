import { Identifier } from "react-admin";
import { UserRoles } from "../../helpers/constants";

export type GameContextType = {
    gameState: GameStateType;
    gameRecord?: GameResourceType;
    sendEvent: (event: any) => Promise<void>;
    setGameState: React.Dispatch<React.SetStateAction<any>>;
};

export type GameEventType = {
    action: string;
    payload?: any;
    senderId?: string;
};

export type Player = {
    id: string;
    name: string;
    user_id: any;
    hasAccepted?: boolean;
    color: "white" | "black";
    remainingTime: number;
    consumedTime: number;
};

export type GameStateType = {
    pgn: string;
    players: Player[];
    status: string;
    lastMoveTime: Date;
    result?: string;
    currentPlayer?: string | undefined;
    reason?: string;
    createdBy?: CreatedByUserType;
    incrementBy: number;
};

export type CreatedByUserType = {
    id: string,
    fullName: string,
    role: typeof UserRoles[keyof typeof UserRoles]
}

export type GameResourceType = {
    id?: Identifier;
    pgn?: string;
    player1_student_id?: string;
    player2_student_id?: string;
    player1_name?: string;
    player2_name?: string;
    status?: string;
    result?: string;
    increment_by?: number;
    pgn_attachment_file_id?: any;
    started_at_timestamp?: Date;
    time_control?: any
    player1_time_number: number;
    player2_time_number: number;
};