import type {RoomData, RoomResponse} from "../model/roomModel.ts";

const rooms: RoomData[] = [];

export const findRoomByIndex = (index: number) => {
    return rooms.find(room => room.roomId === index);
}

export const getAvailableRooms = (): RoomResponse[] => {
    return rooms.filter(room => room.roomUsers.length < 2)
        .map(room => {
            return {
                roomId: room.roomId,
                roomUsers: room.roomUsers
                    .map(user => ({name: user.userData.name, index: user.userData.index})),
            }
    });
}

export const addRoom = () => {
    const roomId = rooms.length + 1;
    const room: RoomData = {
        roomId,
        roomUsers: [],
    }
    rooms.push(room);
    return room;
}