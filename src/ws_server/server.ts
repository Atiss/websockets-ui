import { WebSocketServer } from 'ws';
import {authorize, updateWinners} from './handleUsers.ts';
import {updateRooms, createRoom, addUserToRoom} from "./handleRooms.ts";
import {createGame, addShips, attack, randomAttack} from "./handleGames.ts";
import type {ShipsRequest} from "./model/shipsModel.ts";
import {sendMessage} from "./handleMessages.ts";
import {MessageTypes} from "./model/messagesModel.ts";

export const wss = new WebSocketServer({ port: 3000 });
console.log(`Start ws server on the 3000 port!`);
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        const request = JSON.parse(message.toString());
        switch (request.type) {
            case 'reg':
                console.log('Registering user');
                authorize(JSON.parse(request.data), ws);
                updateRooms(ws);
                updateWinners();
                break;
            case 'create_room':
                console.log('Creating room');
                createRoom(ws);
                updateRooms();
                break;
            case 'add_user_to_room':
                console.log('Adding user to room');
                const room = addUserToRoom(ws, JSON.parse(request.data).indexRoom);
                createGame(room);
                break;
            case 'add_ships':
                console.log('Adding ships');
                const data: ShipsRequest = JSON.parse(request.data);
                addShips(ws, data);
                break;
            case 'randomAttack':
                console.log('Random attack');
                randomAttack(ws, JSON.parse(request.data));
                break;
            case 'attack':
                console.log('Attack');
                attack(ws, JSON.parse(request.data));
                break;
            case 'single_play':
                console.log('Single play');
                break;
            default:
                console.log('Unknown request type');
                sendMessage(ws, MessageTypes.ERROR, {error: true, message: 'Unknown request type'});
                break;
        }

    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
})