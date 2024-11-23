import Storage from "../instant/Storage.js";

export default class LocalStore {
	storage: Storage;

	constructor(
		userId: string,
		public namespace: string,
	) {
		const dbName = `tedy_local_${userId}`;
		this.storage = new Storage(dbName, this.namespace);
	}
}
