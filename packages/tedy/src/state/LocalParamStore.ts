import { appendSymbolToUsage } from "./LastUsed.type.js";
import LocalStore from "./LocalStore.js";
import type { Param, StoredParam } from "./Param.type.js";

export default class LocalParamStore extends LocalStore {
	params: string[] = [];

	constructor(userId?: string) {
		super(userId || "anonymous", "params");
	}

	async getAllParams() {
		this.params = [];

		for await (const [key] of this.storage.db.iterator?.(this.namespace) ||
			[]) {
			this.params.push(key);
		}

		return this.params;
	}

	async hasParam(name: string) {
		return this.storage.db.has(`local.${name}`);
	}

	async getParam(name: string) {
		const rawParam = await this.storage.getItem<StoredParam>(`local.${name}`);
		return rawParam === null
			? undefined
			: ({
					...rawParam,
					usage: appendSymbolToUsage(rawParam.usage),
					context: "local",
					name,
				} satisfies Param);
	}

	async setParam(name: string, { value, static: s, usage }: StoredParam) {
		return this.storage.setItem(`local.${name}`, { value, static: s, usage });
	}

	async deleteParam(name: string) {
		return this.storage.deleteItem(`local.${name}`);
	}
}
