import { FIELD_DIMENSION, IPosition } from './shared.models';
import { AttackStatus } from './game.models';

export enum ShipType {
	small = 'small',
	medium = 'medium',
	large = 'large',
	huge = 'huge',
}

export class CoordinateStatus {
	public position!: IPosition;
	public status?: AttackStatus = undefined;

	constructor(coordinateStatus: CoordinateStatus) {
		Object.assign(this, coordinateStatus);
	}
}

export class Ship {
	public position!: IPosition;
	public direction!: boolean;
	public length!: number;
	public type!: ShipType;

	public shipCoordinateStatuses: CoordinateStatus[] = [];
	public aroundCoordinateStatuses: CoordinateStatus[] = [];

	constructor(ship: Ship) {
		Object.assign(this, ship);
		this.shipCoordinateStatuses = this.fillShipCoordinateStatus();
		this.aroundCoordinateStatuses = this.fillAroundCoordinateStatuses();
	}

	private fillShipCoordinateStatus(): CoordinateStatus[] {
		const coordinateStatuses: CoordinateStatus[] = [];
		const iterateProp: keyof IPosition = this.direction ? 'y' : 'x';
		for (let i: number = this.position[iterateProp]; i < this.position[iterateProp] + this.length; i++) {
			coordinateStatuses.push(new CoordinateStatus({
				position: {
					...this.position,
					[iterateProp]: i,
				},
			}))
		}
		return coordinateStatuses;
	}

	private fillAroundCoordinateStatuses(): CoordinateStatus[] {
		const coordinateStatuses: CoordinateStatus[] = [];
		const startPosition: IPosition = {
			x: this.position.x - 1,
			y: this.position.y - 1,
		};

		const xEndPosition: number = this.direction
			? startPosition.x + 2
			: startPosition.x + 1 + this.length;

		const yEndPosition: number = this.direction
			? startPosition.y + 1 + this.length
			: startPosition.y + 2;


		for (let i: number = startPosition.x; i <= xEndPosition; i++) {
			for (let j: number = startPosition.y; j <= yEndPosition; j++) {
				const position: IPosition = {
					x: i,
					y: j,
				}
				if (this.isValidPosition(position)) {
					coordinateStatuses.push(new CoordinateStatus({
						position,
					}))
				}
			}
		}
		return coordinateStatuses;
	}

	private isValidPosition(position: IPosition): boolean {
		return [ position.x, position.y ].every((coordinate: number) => coordinate >= 0 && coordinate < FIELD_DIMENSION)
			&& !this.isCoordinateOfAShip(position);
	}

	private isCoordinateOfAShip({ x, y }: IPosition): boolean {
		return this.shipCoordinateStatuses.some(({ position }: CoordinateStatus) => position.x === x && position.y === y);
	}
}

export class AddShipsData {
	public gameId!: number;
	public ships!: Ship[];
	public indexPlayer!: number;

	constructor(data: string) {
		const parsedData = JSON.parse(data);
		Object.assign(this, parsedData);
		this.ships = this.ships!.map(ship => new Ship(ship));
	}
}
