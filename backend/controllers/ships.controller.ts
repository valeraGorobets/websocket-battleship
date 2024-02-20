import { IControllerOptions, RequestType, Response } from '../models/shared.models';
import { Player } from '../models/player.models';
import { incorrectInputController, sendResponse } from './common.contoller';
import { WebSocket } from 'ws';
import { Room } from '../models/room.models';
import { AddShipsData } from '../models/ship.models';
import { turnResponseHandler } from './game.controller';
import { GameState } from '../models/game.models';

export function addShipsController(controllerOptions: IControllerOptions): void {
	const {
		request,
		roomDB
	}: IControllerOptions = controllerOptions;
	const addShipsData: AddShipsData = new AddShipsData(request!.data);
	const gameState: GameState = new GameState({
		ships: addShipsData.ships,
		indexPlayer: addShipsData.indexPlayer,
		shotPositions: [],
	});
	const room: Room | undefined = roomDB.get(addShipsData.gameId);

	if (!room) {
		incorrectInputController(controllerOptions);
	}

	const updatedRoom: Room = new Room({
		...room!,
		gameStates: [
			...(room!.gameStates || []),
			gameState,
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
	if (activeRoom.gameStates?.length === 2) {
		activeRoom.gameStates.forEach((gameState: GameState) => {
			const startGameResponse: Response = new Response({
				type: RequestType.start_game,
				data: {
					ships: gameState.ships,
					currentPlayerIndex: gameState.indexPlayer,
				},
			});

			const playerConnection: number = connectionToPlayerIndexDB
				.entries()
				.filter(([ _connectionId, playerIndex ]: [ number, number ]) => playerIndex === gameState.indexPlayer)![0][0];

			const ws: WebSocket = connectionToSocketDB.get(playerConnection)!;
			sendResponse(ws, startGameResponse);
		});
		turnResponseHandler(activeRoom, false, controllerOptions);
	}
}
