import {addUser, findUserByName, getUsersOrderDesc} from "./db/users.ts";
import type {UserRequest, UserResponse, UserStatistics} from "./model/userModel.ts";
import {sendMessage} from "./handleMessages.ts";
import {MessageTypes} from "./model/messagesModel.ts";

export const authorize = (data: UserRequest, ws: WebSocket) => {
    let existingUser = findUserByName(data.name);
    let message = '';
    if ( !existingUser ) {
        existingUser = addUser(data, ws);
        message = RegMessages.REGISTER;
    } else if (existingUser.password === data.password) {
        message = RegMessages.LOGIN;
    } else {
        message = RegMessages.INVALID;
    }

    const userData: UserResponse = {
        name: data.name,
        index: existingUser.index,
        error: message === RegMessages.INVALID,
        message: message,
    }

    sendMessage(ws, MessageTypes.REG, userData);
    return existingUser;
}

export const updateWinners = () => {
    const users = getUsersOrderDesc();
    const data: UserStatistics[] = users.map((user) => ({
        name: user.name,
        wins: user.wins,
    }));

    for (const user of users) {
        sendMessage(user.ws, MessageTypes.UPDATE_WINNERS, data);
    }
}

const RegMessages = {
    REGISTER: 'User registered successfully',
    LOGIN: 'User logged in successfully',
    INVALID: 'Invalid login or password',
}