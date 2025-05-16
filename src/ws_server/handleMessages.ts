export const sendMessage = (ws: WebSocket, type: string, data: any) => {
    const message = JSON.stringify({ type, data: JSON.stringify(data), id: 0 });
    ws.send(message);
}