import {addGame, findGameById} from "./db/game.ts";
import type {RoomData} from "./model/roomModel.ts";
import type {ShipsRequest, Ship} from "./model/shipsModel.ts";
import type {AttackRequest, AttackResponse, Game, TurnRequest} from "./model/gameModel.ts";
import {updateWinners} from "./handleUsers.ts";
import {addWinToUser} from "./db/users.ts";
import {sendMessage} from "./handleMessages.ts";
import {MessageTypes} from "./model/messagesModel.ts";
import {botAttack} from "./handleBot.ts";

export const createGame = (room: RoomData) => {
    const game = addGame(room);

    for(const user of room.roomUsers) {
        const data = {idGame: game.idGame, idPlayer: user.userData.index};
        sendMessage(user.userData.ws, MessageTypes.CREATE_GAME, data);
    }
    return game;
}

const prepareShips = (ships: Ship[]) => {
    ships.forEach(ship => {
        ship.cells = new Array(ship.length).fill(0);
    });
    return ships;
}

export const addShips = (ws: WebSocket, data: ShipsRequest) => {
    const game = findGameById(data.gameId);
    if (!game) return null;

    const player = game.room.roomUsers
        .find(user => user.userData.index === data.indexPlayer);
    if (player) {
        player.ships = prepareShips(data.ships);
    }
    startGame(data);
    setTurn({gameId: data.gameId, indexPlayer: data.indexPlayer});
}

export const startGame = (data: ShipsRequest) => {
    const game = findGameById(data.gameId);
    if (!game) return null;
    if(game.room.roomUsers.filter(user => user.ships?.length>0).length < 2)
        return null;

    for(const player of game.room.roomUsers) {
        const data = {ships: player.ships, currentPlayerIndex: player.userData.index};
        sendMessage(player.userData.ws, MessageTypes.START_GAME, data);
    }
}

export const setTurn = (data: TurnRequest) => {
    const game = findGameById(data.gameId);
    if (!game) return null;
    if (game.room.roomUsers.filter(user => user.ships?.length>0).length < 2)
        return null;
    
    if (game.activePlayer === null) {
        game.activePlayer = game.room.roomUsers[Math.round(Math.random())].userData.index;
    } else {
        game.activePlayer = game.room.roomUsers
            .filter(user => user.userData.index !== game.activePlayer)[0]
            .userData.index;
    }

    for (const player of game.room.roomUsers) {
        sendMessage(player.userData.ws, MessageTypes.TURN, {currentPlayer: game.activePlayer});
    }
}

const provideAttack = (ships: Ship[], x: number, y: number) => {
    for(const ship of ships) {
        if (!ship.direction && ship.position.y === y && ship.position.x <= x && ship.position.x + ship.length > x) {
            ship.cells[x - ship.position.x] = 1;
            return ship;
        }
        if (ship.direction && ship.position.x === x && ship.position.y <= y && ship.position.y + ship.length > y) {
            ship.cells[y - ship.position.y] = 1;
            return ship;
        }
    }
    return null;
}

export const attack = (ws: WebSocket, data: AttackRequest) => {
    const game = findGameById(data.gameId);
    if (!game || data.indexPlayer !== game.activePlayer) return null;

    const enemy = game.room.roomUsers
        .find(user => user.userData.index !== data.indexPlayer);
    if (!enemy)  return null;

    const ship: Ship = provideAttack(enemy.ships, data.x, data.y);
    if (!ship) {
        const result = {status: 'miss', position: {x: data.x, y: data.y}};
        sendAttackMessage({...result, currentPlayer: game.activePlayer}, game);
        setTurn({gameId: data.gameId, indexPlayer: game.activePlayer});
    } else if (ship.cells.filter(cell => cell === 0).length > 0) {
        const result = {status: 'shot', position: {x: data.x, y: data.y}};
        sendAttackMessage({...result, currentPlayer: game.activePlayer}, game);
    } else if (ship.cells.filter(cell => cell === 0).length === 0) {
        killShip(ship, data.indexPlayer, game);
    }
    if (enemy.ships.filter(ship => ship.status !== 'killed').length === 0) {
        for(const player of game.room.roomUsers) {
            sendMessage(player.userData.ws, MessageTypes.FINISH, {winner: data.indexPlayer});
        }
        addWinToUser(data.indexPlayer);
        updateWinners();
        return
    }
    botAttack(game);
}

const killShip = (ship: Ship, currentPlayer: number, game: Game) => {
    if(!ship.direction) {
        for(let i = ship.position.x - 1; i < ship.position.x + ship.length + 1; i++) {
            for(let j = ship.position.y - 1; j < ship.position.y + 2; j++) {
                if(j !== ship.position.y || i < ship.position.x || i >= ship.position.x + ship.length) {
                    sendAttackMessage({status: 'miss', position: {x: i, y: j}, currentPlayer}, game);
                }else{
                    sendAttackMessage({status: 'killed', position: {x: i, y: j}, currentPlayer}, game);
                }
            }
        }
    } else {
        for(let i = ship.position.x - 1; i < ship.position.x + 2; i++) {
            for(let j = ship.position.y - 1; j < ship.position.y + ship.length + 1; j++) {
                if(i !== ship.position.x || j < ship.position.y || j >= ship.position.y + ship.length) {
                    sendAttackMessage({status: 'miss', position: {x: i, y: j}, currentPlayer}, game)
                }else{
                    sendAttackMessage({status: 'killed', position: {x: i, y: j}, currentPlayer}, game);
                }
            }
        }
    }
    ship.status = 'killed';
}

const sendAttackMessage = (data: AttackResponse, game: Game) => {
    for(const player of game.room.roomUsers) {
        sendMessage(player.userData.ws, MessageTypes.ATTACK, data);
    }
}

export const randomAttack = (ws: WebSocket, data: TurnRequest) => {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    attack(ws, {gameId: data.gameId, x, y, indexPlayer: data.indexPlayer});
}