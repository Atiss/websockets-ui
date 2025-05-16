import type {Game} from "../model/gameModel.ts";
import type {RoomData} from "../model/roomModel.ts";

const games: Game[] = [];

export const addGame = (room: RoomData) => {
    const game: Game = {idGame: games.length, room, activePlayer: null};
    games.push(game);
    return game;
}

export const findGameById = (id: number) => {
    return games.find(game => game.idGame === id);
}