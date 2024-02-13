import { Player } from '../models/player.models';

export class PlayerDb {
	private readonly ID_TO_PLAYER: Map<string, Player> = new Map<string, Player>();

	public add(id: string, player: Player): void {
		this.ID_TO_PLAYER.set(id, player);
	}

	public getPlayerById(id: string): Player | undefined {
		return this.ID_TO_PLAYER.get(id);
	}

	public remove(id: string): void {
		this.ID_TO_PLAYER.delete(id);
	}
}
