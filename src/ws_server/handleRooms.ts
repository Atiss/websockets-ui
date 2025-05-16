import {findRoomByIndex, getAvailableRooms, addRoom} from "./db/rooms.ts";
import {findUserByWs, getUsersOrderDesc} from "./db/users.ts";
import {sendMessage} from "./handleMessages.ts";
import {MessageTypes} from "./model/messagesModel.ts";
import type {RoomResponse} from "./model/roomModel.ts";

export const updateRooms = (ws?: WebSocket) => {
    const data: RoomResponse[] = getAvailableRooms();
    if (ws) {
        sendMessage(ws, MessageTypes.UPDATE_ROOM, data);
    } else {
        getUsersOrderDesc().forEach(user => {
            sendMessage(user.ws, MessageTypes.UPDATE_ROOM, data);
        });
    }
}

export const createRoom = (ws: WebSocket) => {
    const room = addRoom();
    room.roomUsers.push({userData: findUserByWs(ws), ships: []});
    return room;
}

export const addUserToRoom = (ws: WebSocket, indexRoom: number) => {
    const user = findUserByWs(ws);
    const room = findRoomByIndex(indexRoom)
    if (!room) return null;
    room.roomUsers.push({userData: user, ships: []});
    return room;
}