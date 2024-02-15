export enum ShipType {
	small = 'small',
	medium = 'medium',
	large = 'large',
	huge = 'huge',
}
export class Ship {
	public position?: { x: number, y: number };
	public direction?: boolean;
	public length?: number;
	public type?: ShipType;

	constructor(ship: Ship) {
		Object.assign(this, ship);
	}
}

export class ShipsState {
	public ships?: Ship[];
	public indexPlayer?: number;

	constructor(shipsState: ShipsState) {
		Object.assign(this, shipsState);
	}
}

export class AddShipsData {
	public gameId?: number;
	public ships?: Ship[];
	public indexPlayer?: number;

	constructor(data: string) {
		const parsedData = JSON.parse(data);
		Object.assign(this, parsedData);
		this.ships = this.ships!.map(ship => new Ship(ship));
	}
}
