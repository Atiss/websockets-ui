import type {RoomData} from "./roomModel.ts";

export interface Game {
    idGame: number;
    room: RoomData;
    activePlayer: number;
}

export interface TurnRequest{
    gameId: number;
    indexPlayer: number;
}

export interface AttackRequest{
    gameId: number;
    x: number;
    y: number;
    indexPlayer: number;
}

export interface AttackResponse {
    position: {
        x: number;
        y: number;
    }
    currentPlayer: number;
    status: string;
}