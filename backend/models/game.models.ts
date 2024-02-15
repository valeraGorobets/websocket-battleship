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
