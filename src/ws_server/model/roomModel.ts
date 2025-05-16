import type {UserData} from "./userModel.ts";
import type {Ship} from "./shipsModel.ts";

export interface RoomData {
    roomId: number;
    roomUsers: {
        userData: UserData;
        ships: Ship[];
    }[];
}

export interface RoomResponse {
    roomId: number;
    roomUsers: {
        name: string;
        index: number;
    }[];
}
