import { IControllerOptions, IPosition, RequestType, Response } from '../models/shared.models';
import { incorrectInputController, sendResponse } from './common.contollers';
import { WebSocket } from 'ws';
import { Room } from '../models/room.models';
import { CoordinateStatus } from '../models/ship.models';
import { AttackData, AttackStatus, GameState, RandomAttackData } from '../models/game.models';
import { BattleshipService } from '../services/battleship.service';
import { Player } from '../models/player.models';

export function randomAttackController(controllerOptions: IControllerOptions): void {
	const { request, roomDB }: IControllerOptions = controllerOptions;
	const randomAttackData: RandomAttackData = new RandomAttackData(request!.data);

	const room: Room | undefined = roomDB.get(randomAttackData.gameId);
	if (!room || !room.gameStates) {
		incorrectInputController(controllerOptions);
	}
	const opponentShipState: GameState = getOpponentShipState(room!, randomAttackData.indexPlayer);
	const randomPosition: IPosition | undefined = BattleshipService.getRandomPosition(opponentShipState);
	if (!randomPosition) {
		return;
	}
	handleAttack(room, { ...randomAttackData, ...randomPosition }, controllerOptions);
}

export function attackController(controllerOptions: IControllerOptions): void {
	const { request, roomDB }: IControllerOptions = controllerOptions;
	const attackData: AttackData = new AttackData(request!.data);
	const room: Room | undefined = roomDB.get(attackData.gameId);
	handleAttack(room, attackData, controllerOptions);
}

function handleAttack(room: Room | undefined, attackData: AttackData, controllerOptions: IControllerOptions): void {
	if (!room || !room.gameStates) {
		incorrectInputController(controllerOptions);
	}

	if (room?.getCurrentPlayerIndex() !== attackData.indexPlayer) {
		return;
	}

	const attackPosition: IPosition = {
		x: attackData.x,
		y: attackData.y,
	}

	const opponentShipState: GameState = getOpponentShipState(room, attackData.indexPlayer);
	const coordinateStatuses: CoordinateStatus[] = BattleshipService.attack(attackPosition, opponentShipState);
	coordinateStatuses.forEach((coordinateStatus: CoordinateStatus) => opponentShipState.shotPositions.push(coordinateStatus.position));
	if (coordinateStatuses.length) {
		attackResponseHandler(room!, coordinateStatuses, controllerOptions);

		const changeTurn: boolean = coordinateStatuses.every(({ status }: CoordinateStatus) => status === AttackStatus.miss);
		turnResponseHandler(room!, changeTurn, controllerOptions);
	}
}

function getOpponentShipState(room: Room, indexPlayer: number) {
	return room!.gameStates!.find((gameState: GameState) => gameState.indexPlayer !== indexPlayer)!;
}

export function turnResponseHandler(activeRoom: Room, changeTurn: boolean, controllerOptions: IControllerOptions): void {
	const {
		connectionToPlayerIndexDB,
		connectionToSocketDB
	}: IControllerOptions = controllerOptions;
	if (changeTurn) {
		activeRoom.setNextPlayerIndex();
	}
	const currentPlayer: number = activeRoom.getCurrentPlayerIndex();
	activeRoom.gameStates!.forEach((gameState: GameState) => {
		const createGameResponse: Response = new Response({
			type: RequestType.turn,
			data: {
				currentPlayer,
			},
		});

		const playerConnection: number = connectionToPlayerIndexDB
			.entries()
			.filter(([ _connectionId, playerIndex ]: [ number, number ]) => playerIndex === gameState.indexPlayer)![0][0];

		const ws: WebSocket = connectionToSocketDB.get(playerConnection)!;
		sendResponse(ws, createGameResponse);
	});
}

export function attackResponseHandler(activeRoom: Room, coordinateStatuses: CoordinateStatus[], controllerOptions: IControllerOptions): void {
	const {
		connectionToPlayerIndexDB,
		connectionToSocketDB
	}: IControllerOptions = controllerOptions;
	activeRoom.roomUsers!.forEach(({ index }: Player) => {
		coordinateStatuses.forEach(({ position, status }: CoordinateStatus) => {
			const createGameResponse: Response = new Response({
				type: RequestType.attack,
				data: {
					position,
					currentPlayer: activeRoom.getCurrentPlayerIndex(),
					status,
				},
			});

			const playerConnection: number = connectionToPlayerIndexDB
				.entries()
				.filter(([ _connectionId, playerIndex ]: [ number, number ]) => playerIndex === index)![0][0];

			const ws: WebSocket = connectionToSocketDB.get(playerConnection)!;
			sendResponse(ws, createGameResponse);
		});
	});
}
