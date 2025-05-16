export interface Ship {
    position: {
        x: number;
        y: number;
    };
    direction: boolean;
    length: number;
    type: string;
    cells: number[];
    status: string;
}

export interface ShipsRequest {
    gameId: number;
    ships: Ship[];
    indexPlayer: number;
}