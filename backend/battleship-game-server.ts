import { MessageEvent, WebSocket, WebSocketServer } from 'ws';
import crypto from 'node:crypto';
import { resolveControllerForRequest } from './services/type-resolver.service';
import { IControllerOptions, Request, TController } from './models/shared.models';
import { controllerAdapter, wsCloseController } from './controllers/common.contollers';

export function launchBattleShipGameServer(port: number): void {
	const wss = new WebSocketServer({ port });
	wss.on('connection', (ws: WebSocket) => {
		const wsID: string = crypto.randomUUID();
		console.log(`New WS connection to port ${ port }: ${ wsID }`);

		ws.on('message', (message: MessageEvent) => {
			console.log(`Received message: ${ message }`);
			try {
				const request: Request = new Request(message.toString());

				const controllerOptions: IControllerOptions = {
					request,
					ws,
				};
				const controller: TController = resolveControllerForRequest(request);
				controllerAdapter(controller, controllerOptions);
			} catch (error) {
				console.log(`Error during parsing message: ${ error }`);
				ws.send(`Error during parsing message: ${ error }`);
			}
		});

		ws.on('close', () => {
			console.log(`Closing WS: ${ wsID }`);
			wsCloseController();
		});
	});
}

