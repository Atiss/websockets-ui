export interface UserRequest {
    name: string;
    password: string;
}

export interface UserResponse {
    name: string;
    index: number;
    error: boolean;
    message: string;
}

export interface User {
    name: string;
    index: number;
}

export type UserData = User & {
    ws: WebSocket;
    password?: string;
    wins: number;
}

export interface UserStatistics {
    name: string;
    wins: number;
}