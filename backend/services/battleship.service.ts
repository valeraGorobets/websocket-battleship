import { FIELD_DIMENSION, IPosition } from '../models/shared.models';
import { AttackStatus, GameState } from '../models/game.models';
import { CoordinateStatus, Ship } from '../models/ship.models';

export class BattleshipService {
	public static getRandomPosition(opponentGameState: GameState): IPosition | undefined {
		for (let x = 0; x < FIELD_DIMENSION; x++) {
			for (let y = 0; y < FIELD_DIMENSION; y++) {
				const position: IPosition = { x, y };
				if (!opponentGameState.shotPositions.find(({ x, y }: IPosition) => position.x === x && position.y === y)) {
					return position;
				}
			}
		}
	}

	public static attack(attackPosition: IPosition, opponentGameState: GameState): CoordinateStatus[] {
		let updatedCoordinateStatus: CoordinateStatus;
		if (opponentGameState.shotPositions.find(({ x, y }: IPosition) => attackPosition.x === x && attackPosition.y === y)) {
			return [];
		} else {
			opponentGameState.shotPositions.push(attackPosition);
		}
		const shotShip: Ship | undefined = opponentGameState.ships.find(
			({ shipCoordinateStatuses }: Ship) => !!shipCoordinateStatuses.find(({ position }: CoordinateStatus) => position.x === attackPosition.x && position.y === attackPosition.y));

		if (!shotShip) {
			return [ new CoordinateStatus({
				position: attackPosition,
				status: AttackStatus.miss,
			}) ];
		}

		shotShip.shipCoordinateStatuses = shotShip.shipCoordinateStatuses.map((coordinateStatus: CoordinateStatus) => {
			if (coordinateStatus.position.x === attackPosition.x && coordinateStatus.position.y === attackPosition.y) {
				updatedCoordinateStatus = new CoordinateStatus({
					...coordinateStatus,
					status: AttackStatus.shot,
				});
				return updatedCoordinateStatus;
			}
			return coordinateStatus;
		});

		const isEveryPartShot: boolean = shotShip.shipCoordinateStatuses.every(({ status }: CoordinateStatus) => status === AttackStatus.shot);
		if (isEveryPartShot) {
			shotShip.shipCoordinateStatuses = BattleshipService.getUpdatedShipCoordinates(shotShip.shipCoordinateStatuses!);
			shotShip.aroundCoordinateStatuses = BattleshipService.getUpdatedAroundCoordinates(shotShip.aroundCoordinateStatuses);
			return [
				...shotShip.shipCoordinateStatuses,
				...shotShip.aroundCoordinateStatuses,
			]
		} else {
			return [ updatedCoordinateStatus! ];
		}
	}

	private static getUpdatedShipCoordinates(shipCoordinateStatuses: CoordinateStatus[]): CoordinateStatus[] {
		return shipCoordinateStatuses.map((coordinateStatus: CoordinateStatus) => {
			return new CoordinateStatus({
				...coordinateStatus,
				status: AttackStatus.killed,
			})
		});
	}

	private static getUpdatedAroundCoordinates(aroundCoordinateStatuses: CoordinateStatus[]): CoordinateStatus[] {
		return aroundCoordinateStatuses.map((coordinateStatus: CoordinateStatus) => {
			return new CoordinateStatus({
				...coordinateStatus,
				status: AttackStatus.miss,
			})
		});
	}
}
