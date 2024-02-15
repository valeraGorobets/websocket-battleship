import { Player } from './player.models';
import { generateId } from '../services/utils';
import { ShipsState } from './ship.models';

export class Room {
	public roomId: number = generateId();
	public roomUsers: Player[] = [];
	public shipsStates?: ShipsState[];
	private currentPlayerIndex?: number;

	constructor(room: Partial<Room> = {}) {
		Object.assign(this, room);
	}

	public getNextPlayerIndex(): number {
		if (!this.currentPlayerIndex) {
			this.currentPlayerIndex = this.roomUsers[0].index;
		} else {
			this.currentPlayerIndex = this.currentPlayerIndex === this.roomUsers[0].index
				? this.roomUsers[1].index
				: this.roomUsers[0].index;
		}

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

