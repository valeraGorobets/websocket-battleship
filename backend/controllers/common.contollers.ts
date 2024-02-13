import { IControllerOptions, TController } from '../models/shared.models';

export function controllerAdapter(
	controller: TController,
	controllerOptions: IControllerOptions,
): void {
	const { request, ws } = controllerOptions;

	try {
		const responseData: object = controller(controllerOptions);
		const res = {
			type: request.type,
			data: JSON.stringify(responseData),
			id: 0,
		}
		ws.send(JSON.stringify(res));
	} catch (error) {
		console.log(error);
	}
}

export function pageNotFoundController(): object {
	return {
		error: true,
		errorText: 'Unknown type send',
	};
}

export function wsCloseController(): void {
	// players.delete(wsID);
	// connections.delete(wsID);
}
