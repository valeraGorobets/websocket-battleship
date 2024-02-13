import { registrationController } from '../controllers/player.controllers';
import { Request, RequestType, TController } from '../models/shared.models';
import { pageNotFoundController } from '../controllers/common.contollers';

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
];

export function resolveControllerForRequest(request: Request): TController {
	const controller = TYPE_CONFIGS
		.find((route: TypeConfig) => route.type === request.type)
		?.controller;

	return controller || pageNotFoundController;
}
