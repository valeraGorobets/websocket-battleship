import { IControllerOptions, RequestType, Response } from '../models/shared.models';
import { Player } from '../models/player.models';
import { incorrectInputController, sendResponse } from './common.contollers';
import { WebSocket } from 'ws';
import { Room } from '../models/room.models';
import { AddShipsData, ShipsState } from '../models/ship.models';
import { turnResponseHandler } from './game.controllers';

export function addShipsController(controllerOptions: IControllerOptions): void {
	const {
		request,
		roomDB
	}: IControllerOptions = controllerOptions;
	const addShipsData: AddShipsData = new AddShipsData(request!.data);
	const shipsState: ShipsState = new ShipsState({
		ships: addShipsData.ships,
		indexPlayer: addShipsData.indexPlayer,
	})
	const room: Room | undefined = roomDB.get(addShipsData.gameId);

	if (!room) {
		incorrectInputController(controllerOptions);
	}

	const updatedRoom: Room = new Room({
		...room!,
		shipsStates: [
			...(room!.shipsStates || []),
			shipsState,
		]
	})

	roomDB.add(updatedRoom.roomId, updatedRoom);
	tryStartGameResponseHandler(controllerOptions);
}

export function tryStartGameResponseHandler(controllerOptions: IControllerOptions): void {
	const {
		connectionId,
		roomDB,
		connectionToPlayerIndexDB,
		connectionToSocketDB
	}: IControllerOptions = controllerOptions;
	const playerId: number = connectionToPlayerIndexDB.get(connectionId)!;
	const activeRoom: Room = roomDB
		.values()
		.find(({ roomUsers }: Room) =>
			roomUsers.length === 2
			&& roomUsers.find(({ index }: Player) => index === playerId),
		)!;
	if (activeRoom.shipsStates?.length === 2) {
		activeRoom.shipsStates.forEach((shipsState: ShipsState) => {
			const createGameResponse: Response = new Response({
				type: RequestType.start_game,
				data: {
					ships: shipsState.ships,
					currentPlayerIndex: shipsState.indexPlayer,
				},
			});

			const playerConnection: number = connectionToPlayerIndexDB
				.entries()
				.filter(([ _connectionId, playerIndex ]: [ number, number ]) => playerIndex === shipsState.indexPlayer)![0][0];

			const ws: WebSocket = connectionToSocketDB.get(playerConnection)!;
			sendResponse(ws, createGameResponse);
		});
		turnResponseHandler(activeRoom, controllerOptions);
	}
}
