import { Player } from './player.models';
import { generateId } from '../services/utils';

export class Room {
	public roomId: number = generateId();
	public roomUsers: Player[] = [];

	constructor(room: Partial<Room> = {}) {
		Object.assign(this, room);
	}
}

export class AddUserToRoomData {
	public readonly indexRoom?: number;

	constructor(data: string) {
		const parsedData = JSON.parse(data);
		Object.assign(this, parsedData);
	}
}

