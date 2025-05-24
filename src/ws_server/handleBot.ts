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
    let ships = null;
    while(!ships) {
        ships = createShips();
    }
    addShips(null, {gameId: game.idGame, indexPlayer: bot.index, ships: ships});
}

export const botAttack = (game: Game) => {
    const bot = game.room.roomUsers.find(user => user.userData.name === 'bot');
    if (!bot || bot.userData.index !== game.activePlayer) return;
    const interval = setInterval(() => {
        const attackRequest = {
            gameId: game.idGame,
            indexPlayer: bot.userData.index,
        };
        const result = randomAttack(null, attackRequest);
        if (result?.status === 'miss') {
            clearInterval(interval);
        }
    }, 1000)
}

export const createShips = () => {
    let matrix = createMatrix(10, 10, 0);
    const ships: Ship[] = [];
    for (let i = 4; i > 0; i--) {
        for (let j = 0; j+i-1 < 4; j++) {
            const counter = 0;
            const {x, y, direction, newMatrix} = createShip(matrix, i, counter);
            matrix = newMatrix;
            if (!matrix) {
                console.log("Error creating ship");
                return null;
            }
            const ship: Ship = {
                position: {x, y},
                length: i,
                direction: direction,
                cells: [],
                status: 'alive',
                type: 'bot',
            };
            ship.cells.fill(0, 0, ship.length);
            ships.push(ship);
        }
    }
    return ships;
}

const createShip = (matrix: [][], length: number, counter) => {
    let direction;
    let x;
    let y;
    let newMatrix = null;
    while (!newMatrix && counter <= 1000) {
        counter++;
        direction = Math.random() > 0.5;
        x = Math.floor(Math.random() * 10);
        x = !direction && x > 9-length ? (x+length)%10 : x;
        y = Math.floor(Math.random() * 10);
        y = direction && y > 9-length ? (y+length)%10 : y;
        newMatrix = fillMatrix(matrix, x, y, length, direction);
    }
    if(counter===1000) return null;
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
    if (!direction) {
        for (let i = x-1; i < x+length+1; i++) {
            for(let j = y-1; j < y+2; j++) {
                if( i < 0 || i >= matrix.length || j < 0 || j >= matrix[i].length) continue;
                if(!matrix[i][j]) {
                    if (j !== y || i < x || i >= x + length) matrix[i][j] = 4;
                    else matrix[i][j] = 1;
                } else
                    return null;
            }
        }
    } else {
        for (let i = x-1; i < x+2; i++) {
            for(let j = y-1; j < y+length+1; j++) {
                if( i < 0 || i >= matrix.length || j < 0 || j >= matrix[i].length) continue;
                if(!matrix[i][j]) {
                    if(i !== x || j < y || j >= y + length) matrix[i][j] = 4;
                    else matrix[i][j] = 1;
                }
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
