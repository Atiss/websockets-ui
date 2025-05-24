import {WebSocketServer} from "ws";
import type {UserData, UserRequest} from "../model/userModel.ts";

const users: UserData[] = [];

export const findUserByWs = (ws: WebSocketServer) => {
    return users.find(user => user.ws === ws);
}

export const findUserByName = (name: string) => {
    return users.find(user => user.name === name);
}

export const addWinToUser = (id: number) => {
    const user = users.find(user => user.index === id);
    if (user) {
        user.wins++;
    }
}

export const addUser = (data: UserRequest, ws: WebSocket)=> {
    const user = { name: data.name, password: data.password, index: users.length, wins: 0, ws };
    users.push(user);
    return user;
}

export const getUsersOrderDesc = () => {
    return users.sort((a, b) => b.wins - a.wins);
}