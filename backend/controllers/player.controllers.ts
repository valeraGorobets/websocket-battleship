import { Credentials, Player } from '../models/player.models';
import { notifyAllConnections, sendResponse } from './common.contollers';
import { IControllerOptions, RequestType, Response } from '../models/shared.models';
import { WebSocket } from 'ws';
import { updateRoomResponseHandler } from './room.controllers';
import { DB } from '../db/db';
import { updateWinnersResponseHandler } from './game.controllers';

function isUserLoggedIn(credentials: Credentials, playerDB: DB<Player>) {
	const credentialsHash: string = credentials.getHash();
	return !!playerDB.values().find(({ hash }: Player) => hash === credentialsHash);
}

export function registrationController(controllerOptions: IControllerOptions): void {
	const {
		connectionId,
		request,
		connectionToSocketDB,
		playerDB,
		connectionToPlayerIndexDB
	}: IControllerOptions = controllerOptions;
	const credentials: Credentials = new Credentials(request!.data);
	const player: Player = new Player(credentials);
	const ws: WebSocket = connectionToSocketDB.get(connectionId)!;
	if (isUserLoggedIn(credentials, playerDB)) {
		registrationFailResponseHandler(ws, 'User already is logged in');
		return;
	}
	playerDB.add(player.index, player);
	connectionToPlayerIndexDB.add(connectionId, player.index);
	registrationResponseHandler(ws, controllerOptions);
	notifyAllConnections(updateRoomResponseHandler, controllerOptions);
	notifyAllConnections(updateWinnersResponseHandler, controllerOptions);
}

export function registrationResponseHandler(ws: WebSocket, controllerOptions: IControllerOptions): void {
	const { connectionId, playerDB, connectionToPlayerIndexDB }: IControllerOptions = controllerOptions;
	const playerId: number = connectionToPlayerIndexDB.get(connectionId)!;
	const player: Player = playerDB.get(playerId)!;
	const registrationResponse: Response = new Response({
		type: RequestType.reg,
		data: {
			name: player.name,
			index: player.index,
			error: false,
			errorText: '',
		},
	});
	sendResponse(ws, registrationResponse);
}

function registrationFailResponseHandler(ws: WebSocket, errorText: string): void {
	const registrationFailResponse: Response = new Response({
		type: RequestType.reg,
		data: {
			error: true,
			errorText,
		},
	});
	sendResponse(ws, registrationFailResponse);
}
