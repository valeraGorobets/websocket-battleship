import { WebSocketServer, WebSocket, MessageEvent } from 'ws';


export function initBattleShipGameServer(): void {
	const wss = new WebSocketServer({ port: 3000 });
	wss.on('connection', function connection(ws: WebSocket) {
		ws.onmessage = ((m: MessageEvent) => {
			console.log(m);
			ws.send('Hello from backend 11');
		})
	});
}
