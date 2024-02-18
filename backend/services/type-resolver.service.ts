import { registrationController } from '../controllers/player.controllers';
import { Request, RequestType, TController } from '../models/shared.models';
import { pageNotFoundController } from '../controllers/common.contollers';
import { addUserToRoomController, createRoomController } from '../controllers/room.controllers';
import { addShipsController } from '../controllers/ships.controllers';
import { attackController, randomAttackController } from '../controllers/game.controllers';

class TypeConfig {
	public type?: RequestType;
	public controller?: TController;

	constructor(object: TypeConfig) {
		Object.assign(this, object);
	}
}

const TYPE_CONFIGS: TypeConfig[] = [
	new TypeConfig({
		type: RequestType.reg,
		controller: registrationController,
	}),
	new TypeConfig({
		type: RequestType.create_room,
		controller: createRoomController,
	}),
	new TypeConfig({
		type: RequestType.add_user_to_room,
		controller: addUserToRoomController,
	}),
	new TypeConfig({
		type: RequestType.add_ships,
		controller: addShipsController,
	}),
	new TypeConfig({
		type: RequestType.attack,
		controller: attackController,
	}),
	new TypeConfig({
		type: RequestType.randomAttack,
		controller: randomAttackController,
	}),
];

export function resolveControllerForRequest(request: Request): TController {
	const controller = TYPE_CONFIGS
		.find((route: TypeConfig) => route.type === request.type)
		?.controller;

	return controller || pageNotFoundController;
}
