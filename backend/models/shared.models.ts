import { WebSocket } from 'ws';

export enum RequestType {
	reg = 'reg',
	create_game = 'create_game',
	start_game = 'start_game',
	turn = 'turn',
	attack = 'attack',
	finish = 'finish',
	update_room = 'update_room',
	update_winners = 'update_winners',
}

export type TController = (controllerOptions: IControllerOptions) => object;

export interface IControllerOptions {
	request: Request;
	ws: WebSocket;
}

export class Request {
	private readonly id: number = 0;
	public readonly type?: RequestType;
	public readonly data: string = '';

	constructor(message: string) {
		const parsedMessage = JSON.parse(message);
		Object.assign(this, parsedMessage);
	}
}
