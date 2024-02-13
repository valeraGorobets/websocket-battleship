import { IControllerOptions } from '../models/shared.models';
import { Player, Credentials } from '../models/player.models';

export function registrationController({ request }: IControllerOptions): object {
	const credentials: Credentials = new Credentials(request.data);
	const player: Player = new Player(credentials);
	// players.set(wsID, player);
	// connections.set(wsID, ws);
	const data = {
		name: player.name,
		index: 1,
		error: true,
		errorText: 'User already is logged in',
	};

	return data;
}
