import { WebSocket } from 'ws';
import { DB } from '../db/db';
import { Player } from './player.models';
import { Room } from './room.models';
import { Winner } from './game.models';

export const FIELD_DIMENSION: number = 10;

export enum RequestType {
	add_ships = 'add_ships',
	add_user_to_room = 'add_user_to_room',
	attack = 'attack',
	create_game = 'create_game',
	create_room = 'create_room',
	finish = 'finish',
	randomAttack = 'randomAttack',
	reg = 'reg',
	single_play = 'single_play',
	start_game = 'start_game',
	turn = 'turn',
	update_room = 'update_room',
	update_winners = 'update_winners',
}

export type TController = (controllerOptions: IControllerOptions) => void;
export type THandler = (ws: WebSocket, controllerOptions: IControllerOptions) => void;

export interface IControllerOptions {
	connectionId: number;
	playerDB: DB<Player>;
	connectionToPlayerIndexDB: DB<number>;
	connectionToSocketDB: DB<WebSocket>;
	roomDB: DB<Room>;
	winnersDB: DB<Winner>;
	request?: Request;
}

export interface IPosition {
	x: number;
	y: number;
}

abstract class CommunicationProtocol {
	private readonly id?: number = 0;
	public readonly type?: RequestType;

	protected constructor(obj: object) {
		Object.assign(this, obj);
	}
}

export class Request extends CommunicationProtocol {
	public readonly data: string = '';

	constructor(message: string) {
		const parsedMessage = JSON.parse(message);
		super(parsedMessage);
		this.data = parsedMessage.data;
	}
}

export class Response extends CommunicationProtocol {
	public readonly data: any;

	constructor(response: Response) {
		super(response);
		this.data = JSON.stringify(response.data);
	}
}
