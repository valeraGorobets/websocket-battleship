import { generateId } from '../services/utils';

export class Player {
	public readonly index: number = generateId();
	public readonly name!: string;
	public readonly hash!: string;

	constructor(credentials: Credentials) {
		this.name = credentials.name;
		this.hash = credentials.getHash();
	}
}

export class Credentials {
	public readonly name!: string;
	private readonly password!: string;

	constructor(data: string) {
		const parsedData = JSON.parse(data);
		Object.assign(this, parsedData);
	}

	public getHash(): string {
		return `${ this.name }_${ this.password }`;
	}
}
