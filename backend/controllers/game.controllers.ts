import { IControllerOptions, RequestType, Response } from '../models/shared.models';
import { incorrectInputController, sendResponse } from './common.contollers';
import { WebSocket } from 'ws';
import { Room } from '../models/room.models';
import { ShipsState } from '../models/ship.models';
import { AttackData } from '../models/game.models';

export function attackController(controllerOptions: IControllerOptions): void {
	const {
		request,
		roomDB
	}: IControllerOptions = controllerOptions;
	const attackData: AttackData = new AttackData(request!.data);
	const room: Room | undefined = roomDB.get(attackData.gameId);

	if (!room) {
		incorrectInputController(controllerOptions);
	}

	// const updatedRoom: Room = new Room({
	// 	...room!,
	// 	shipsStates: [
	// 		...(room!.shipsStates || []),
	// 		shipsState,
	// 	]
	// })
	//
	// roomDB.add(updatedRoom.roomId, updatedRoom);
	// tryStartGameResponseHandler(controllerOptions);
}

export function turnResponseHandler(activeRoom: Room, controllerOptions: IControllerOptions): void {
	const {
		connectionToPlayerIndexDB,
		connectionToSocketDB
	}: IControllerOptions = controllerOptions;
	const currentPlayer: number = activeRoom.getNextPlayerIndex();
	activeRoom.shipsStates!.forEach((shipsState: ShipsState) => {
		const createGameResponse: Response = new Response({
			type: RequestType.turn,
			data: {
				currentPlayer,
			},
		});

		const playerConnection: number = connectionToPlayerIndexDB
			.entries()
			.filter(([ _connectionId, playerIndex ]: [ number, number ]) => playerIndex === shipsState.indexPlayer)![0][0];

		const ws: WebSocket = connectionToSocketDB.get(playerConnection)!;
		sendResponse(ws, createGameResponse);
	});
}

// export function attackResponseHandler(activeRoom: Room, controllerOptions: IControllerOptions): void {
// 	const {
// 		connectionToPlayerIndexDB,
// 		connectionToSocketDB
// 	}: IControllerOptions = controllerOptions;
// 	const currentPlayer: number = activeRoom.getNextPlayerIndex();
// 	activeRoom.shipsStates!.forEach((shipsState: ShipsState) => {
// 		const createGameResponse: Response = new Response({
// 			type: RequestType.turn,
// 			data: {
// 				position:
// 					{
// 						x: <number>,
// 						y: <number>,
// 					},
// 				currentPlayer: <number>, /* id of the player in the current game */
// 				status: "miss"|"killed"|"shot",
// 			},
// 		});
//
// 		const playerConnection: number = connectionToPlayerIndexDB
// 			.entries()
// 			.filter(([ _connectionId, playerIndex ]: [ number, number ]) => playerIndex === shipsState.indexPlayer)![0][0];
//
// 		const ws: WebSocket = connectionToSocketDB.get(playerConnection)!;
// 		sendResponse(ws, createGameResponse);
// 	});
// }
