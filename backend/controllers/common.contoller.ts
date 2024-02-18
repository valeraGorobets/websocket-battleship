import { IControllerOptions, Response, THandler } from '../models/shared.models';
import { WebSocket } from 'ws';
import { updateRoomResponseHandler } from './room.controller';
import { Room } from '../models/room.models';
import { Player } from '../models/player.models';
import { endGame } from './game.controller';

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
		connectionToSocketDB,
		roomDB,
	}: IControllerOptions = controllerOptions;
	console.log(`Closing WS: ${ connectionId }`);
	const playerId: number = connectionToPlayerIndexDB.get(connectionId)!;

	const activeRoom: Room = roomDB.values()
		.find(({ roomUsers }: Room) => !!roomUsers
			.find(({ index }: Player) => playerId === index)
		)!;
	if (!activeRoom) {
		return;
	}
	const winPlayerId: number = activeRoom.roomUsers
		.find(({ index }: Player) => playerId !== index)!.index;
	endGame(activeRoom, winPlayerId, controllerOptions);
	notifyAllConnections(updateRoomResponseHandler, controllerOptions);
	playerDB.delete(playerId);
	connectionToPlayerIndexDB.delete(connectionId);
	connectionToSocketDB.delete(connectionId);
}

export function notifyAllConnections(handler: THandler, controllerOptions: IControllerOptions): void {
	const { connectionToSocketDB }: IControllerOptions = controllerOptions;
	connectionToSocketDB
		.values()
		.forEach((ws: WebSocket) => handler(ws, controllerOptions))
}
