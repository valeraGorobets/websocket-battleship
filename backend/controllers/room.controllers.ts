import { IControllerOptions, RequestType, Response } from '../models/shared.models';
import { Player } from '../models/player.models';
import { incorrectInputController, notifyAllConnections, sendResponse } from './common.contollers';
import { WebSocket } from 'ws';
import { AddUserToRoomData, Room } from '../models/room.models';

export function createRoomController(controllerOptions: IControllerOptions): void {
	const { connectionId, connectionToPlayerIndexDB, playerDB, roomDB }: IControllerOptions = controllerOptions;
	const playerId: number = connectionToPlayerIndexDB.get(connectionId)!;
	const player: Player = playerDB.get(playerId)!;
	const room: Room = new Room({
		roomUsers: [ player ],
	});
	roomDB.add(room.roomId, room);

	notifyAllConnections(updateRoomResponseHandler, controllerOptions);
}

export function addUserToRoomController(controllerOptions: IControllerOptions): void {
	const {
		connectionId,
		request,
		connectionToPlayerIndexDB,
		playerDB,
		roomDB
	}: IControllerOptions = controllerOptions;
	const playerId: number = connectionToPlayerIndexDB.get(connectionId)!;
	const player: Player = playerDB.get(playerId)!;
	const addUserToRoomData: AddUserToRoomData = new AddUserToRoomData(request!.data);
	const room: Room | undefined = roomDB.get(addUserToRoomData.indexRoom);

	if (!room) {
		incorrectInputController(controllerOptions);
	} else if (!!room.roomUsers.find(({ index }: Player) => index === playerId)) {
		return;
	}

	const updatedRoom: Room = new Room({
		...room!,
		roomUsers: [
			...room!.roomUsers,
			player,
		],
	})

	roomDB.add(updatedRoom.roomId, updatedRoom);

	notifyAllConnections(updateRoomResponseHandler, controllerOptions);
	createGameResponseHandler(controllerOptions);
}

export function updateRoomResponseHandler(ws: WebSocket, controllerOptions: IControllerOptions): void {
	const { roomDB }: IControllerOptions = controllerOptions;
	const roomData: any[] = roomDB
		.values()
		.filter(({ roomUsers }: Room) => roomUsers.length === 1)
		.map(({ roomId, roomUsers }: Room) =>({ roomId, roomUsers }));
	const updateRoomResponse: Response = new Response({
		type: RequestType.update_room,
		data: roomData,
	});

	sendResponse(ws, updateRoomResponse);
}

export function createGameResponseHandler(controllerOptions: IControllerOptions): void {
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
	activeRoom.roomUsers.forEach((player: Player) => {
		const createGameResponse: Response = new Response({
			type: RequestType.create_game,
			data: {
				idGame: activeRoom.roomId,
				idPlayer: player.index,
			},
		});

		const playerConnection: number = connectionToPlayerIndexDB
			.entries()
			.filter(([ _connectionId, playerIndex ]: [ number, number ]) => playerIndex === player.index)![0][0];

		const ws: WebSocket = connectionToSocketDB.get(playerConnection)!;
		sendResponse(ws, createGameResponse);
	})
}

export function removeUserFromGame(playerId: number, controllerOptions: IControllerOptions) {
	const { roomDB }: IControllerOptions = controllerOptions;
	roomDB.entries().forEach(([ roomId, room ]: [ number, Room ]) => {
		if (!!room.roomUsers.find(({ index }: Player) => index === playerId)) {
			roomDB.delete(roomId);
		}
	});
	notifyAllConnections(updateRoomResponseHandler, controllerOptions);
}
