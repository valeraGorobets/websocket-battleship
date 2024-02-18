import { Ship } from './ship.models';
import { IPosition } from './shared.models';

export class RandomAttackData {
	public gameId!: number;
	public indexPlayer!: number;

	constructor(data: string) {
		const parsedData = JSON.parse(data);
		Object.assign(this, parsedData);
	}
}

export class AttackData {
	public gameId!: number;
	public x!: number;
	public y!: number;
	public indexPlayer!: number;

	constructor(data: string) {
		const parsedData = JSON.parse(data);
		Object.assign(this, parsedData);
	}
}

export enum AttackStatus {
	miss = 'miss',
	killed = 'killed',
	shot = 'shot',
}

export class GameState {
	public ships!: Ship[];
	public indexPlayer!: number;
	public shotPositions: IPosition[] = [];

	constructor(gameState: GameState) {
		Object.assign(this, gameState);
	}
}
