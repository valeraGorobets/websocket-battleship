import { Player } from './player.models';
import { generateId } from '../services/utils';

import { GameState } from './game.models';

export class Room {
	public roomId: number = generateId();
	public roomUsers: Player[] = [];
	public gameStates?: GameState[];
	private currentPlayerIndex: number = -1;

	constructor(room: Partial<Room> = {}) {
		Object.assign(this, room);
		this.currentPlayerIndex = this.roomUsers[0].index;
	}

	public setNextPlayerIndex(): void {
		this.currentPlayerIndex = this.currentPlayerIndex === this.roomUsers[0].index
			? this.roomUsers[1].index
			: this.roomUsers[0].index;
	}

	public getCurrentPlayerIndex(): number {
		return this.currentPlayerIndex;
	}
}

export class AddUserToRoomData {
	public readonly indexRoom!: number;

	constructor(data: string) {
		const parsedData = JSON.parse(data);
		Object.assign(this, parsedData);
	}
}

