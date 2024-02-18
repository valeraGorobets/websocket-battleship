import { IControllerOptions, Response, THandler } from '../models/shared.models';
import { WebSocket } from 'ws';
import { removeUserFromGame } from './room.controllers';

export function sendResponse(ws: WebSocket, response: Response): void {
	try {
		ws.send(JSON.stringify(response));
	} catch (error) {
		console.log(error);
	}
}

export function pageNotFoundController(controllerOptions: IControllerOptions): void {
	const { request, connectionId, connectionToSocketDB }: IControllerOptions = controllerOptions;
	const ws: WebSocket = connectionToSocketDB.get(connectionId)!;
	const pageNotFoundResponse: Response = new Response({
		type: request?.type,
		data: {
			error: true,
			errorText: 'Unknown type send',
		},
	});
	sendResponse(ws, pageNotFoundResponse);
}

export function incorrectInputController(controllerOptions: IControllerOptions): void {
	const { request, connectionId, connectionToSocketDB }: IControllerOptions = controllerOptions;
	const ws: WebSocket = connectionToSocketDB.get(connectionId)!;
	const incorrectInputResponse: Response = new Response({
		type: request?.type,
		data: {
			error: true,
			errorText: 'Incorrect items are sent in the input',
		},
	});
	sendResponse(ws, incorrectInputResponse);
}

export function wsCloseController(controllerOptions: IControllerOptions): void {
	const {
		connectionId,
		playerDB,
		connectionToPlayerIndexDB,
		connectionToSocketDB
	}: IControllerOptions = controllerOptions;
	console.log(`Closing WS: ${ connectionId }`);
	const playerId: number = connectionToPlayerIndexDB.get(connectionId)!;
	playerDB.delete(playerId);
	connectionToPlayerIndexDB.delete(connectionId);
	connectionToSocketDB.delete(connectionId);
	removeUserFromGame(playerId, controllerOptions);
}

export function notifyAllConnections(handler: THandler, controllerOptions: IControllerOptions): void {
	const { connectionToSocketDB } = controllerOptions;
	connectionToSocketDB
		.values()
		.forEach((ws: WebSocket) => handler(ws, controllerOptions))
}
