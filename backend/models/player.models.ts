export class Player {
	public readonly name: string = '';
	private readonly password: string = '';

	constructor(credentials: Credentials) {
		this.name = credentials.name;
		this.password = credentials.password;
	}
}

export class Credentials {
	public name: string = '';
	public password: string = '';

	constructor(data: string) {
		const parsedMessage = JSON.parse(data);
		Object.assign(this, parsedMessage);
	}
}
