import { MessageEvent, WebSocket, WebSocketServer } from 'ws';
import { resolveControllerForRequest } from './services/type-resolver.service';
import { IControllerOptions, Request, TController } from './models/shared.models';
import { wsCloseController } from './controllers/common.contollers';
import { DB } from './db/db';
import { Player } from './models/player.models';
import { Room } from './models/room.models';
import { generateId } from './services/utils';
import { Winner } from './models/game.models';

export function launchBattleShipGameServer(port: number): void {
	const playerDB: DB<Player> = new DB();
	const connectionToPlayerDB: DB<number> = new DB();
	const roomDB: DB<Room> = new DB();
	const connectionToSocketDB: DB<WebSocket> = new DB();
	const winnersDB: DB<Winner> = new DB();

	const wss = new WebSocketServer({ port });
	wss.on('connection', (ws: WebSocket) => {
		const connectionId: number = generateId();
		connectionToSocketDB.add(connectionId, ws);
		console.log(`New WS connection to port ${ port }: ${ connectionId }`);

		ws.on('message', (message: MessageEvent) => {
			console.log(`Received message: ${ message }`);
			try {
				const request: Request = new Request(message.toString());

				const controllerOptions: IControllerOptions = {
					connectionId,
					request,
					connectionToSocketDB,
					playerDB,
					connectionToPlayerIndexDB: connectionToPlayerDB,
					roomDB,
					winnersDB,
				};
				const controller: TController = resolveControllerForRequest(request);
				controller(controllerOptions);
			} catch (error) {
				console.log(`Error during parsing message: ${ error }`);
				ws.send(`Error during parsing message: ${ error }`);
			}
		});

		ws.on('close', () => {
			const controllerOptions: IControllerOptions = {
				connectionId,
				connectionToSocketDB,
				playerDB,
				connectionToPlayerIndexDB: connectionToPlayerDB,
				roomDB,
				winnersDB,
			};
			wsCloseController(controllerOptions);
		});
	});
}

