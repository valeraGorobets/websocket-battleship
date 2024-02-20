export class DB<T> {
	private readonly db: Map<number, T> = new Map<number, T>();

	public add(id: number, item: T): void {
		this.db.set(id, item);
	}

	public get(id?: number): T | undefined {
		return !!id
			? this.db.get(id)
			: undefined;
	}

	public delete(id: number): void {
		this.db.delete(id);
	}

	public values(): T[] {
		return Array.from(this.db.values());
	}

	public entries(): [ number, T ][] {
		return Array.from(this.db.entries());
	}
}
