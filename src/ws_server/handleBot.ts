import {addShips, createGame, randomAttack} from "./handleGames.ts";
import type {Ship} from "./model/shipsModel.ts";
import type {RoomData} from "./model/roomModel.ts";
import {addUser, findUserByName} from "./db/users.ts";
import type {Game} from "./model/gameModel.ts";

export const createBot = (room: RoomData) => {
    let bot = findUserByName('bot');
    if (!bot) bot = addUser({name: 'bot', password: 'bot'}, null);
    room.roomUsers.push({userData: bot, ships: []});
    const game = createGame(room);
    addShips(null, {gameId: game.idGame, indexPlayer: bot.index, ships: createShips()});
    botAttack(game);
}

export const botAttack = (game: Game) => {
    const bot = game.room.roomUsers.find(user => user.userData.name === 'bot');
    if (!bot) return;
    const attackRequest = {
        gameId: game.idGame,
        indexPlayer: bot.userData.index,
    };
    randomAttack(null, attackRequest);
}

export const createShips = () => {
    let matrix = createMatrix(10, 10, 0);
    const ships: Ship[] = [];
    for (let i = 4; i > 0; i--) {
        for (let j = 0; j+i < 4; j++) {
            const {x, y, direction, newMatrix} = createShip(matrix, i+1);
            matrix = newMatrix;
            const ship: Ship = {
                position: {x, y},
                length: i+1,
                direction: direction,
                cells: [],
                status: 'alive',
                type: 'bot',
            };
            ship.cells.fill(0, 0, ship.length);
            ships.push(ship);
        }
    }
    console.log("ships", ships);
    return ships;
}

const createShip = (matrix: [][], length: number) => {
    const direction = Math.random() > 0.5;
    let x = Math.floor(Math.random() * 10);
    x = !direction ? (x+1)%10 : x;
    let y = Math.floor(Math.random() * 10);
    y =  direction ? (y+1)%10 : y;
    const newMatrix = fillMatrix(matrix, x, y, length, direction);
    if (!newMatrix) {
        return createShip(matrix, length);
    }
    return {x, y, direction, newMatrix};
}

const createMatrix = (x: number, y: number, fill: number) => {
    const matrix = [];
    for (let i = 0; i < x; i++) {
        const row = [];
        for (let j = 0; j < y; j++) {
            row.push(fill);
        }
        matrix.push(row);
    }
    return matrix;
}

const fillMatrix = (initMatrix: number[][], x: number, y: number, length: number, direction: boolean) => {
    const matrix = cloneMatrix(initMatrix);
    if (direction) {
        for (let i = x-1; i < x+length+1; i++) {
            for(let j = y-1; j < y+2; j++) {
                if( i < 0 || i >= matrix.length || j < 0 || j >= matrix[i].length) continue;
                if(!matrix[i][j]) matrix[i][j] = 1;
                else return null;
            }
        }
    } else {
        for (let i = x-1; i < x+2; i++) {
            for(let j = y-1; j < y+length+1; j++) {
                if( i < 0 || i >= matrix.length || j < 0 || j >= matrix[i].length) continue;
                if(!matrix[i][j]) matrix[i][j] = 1;
                else return null;
            }
        }
    }
    return matrix;
}

const cloneMatrix = (matrix: number[][]) => {
    const newMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        newMatrix[i] = [];
        for (let j = 0; j < matrix[i].length; j++) {
            newMatrix[i][j] = matrix[i][j];
        }
    }
    return newMatrix;
}
