import Keyv from "keyv";
import KeyvSqlite from "@keyv/sqlite";
import { join, relative } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { cwd } from "node:process";

const rootDir = relative(cwd(), join(homedir(), ".tedy"));

export default class Storage {
	public db: Keyv;

	constructor(dbName: string, namespace?: string) {
		if (!existsSync(rootDir)) {
			mkdirSync(rootDir, { recursive: true });
		}

		const keyv = new Keyv(
			new KeyvSqlite(`${rootDir}/${dbName}.sqlite`),
			namespace ? { namespace } : undefined,
		);
		this.db = keyv;
	}

	async getItem<T = string>(k: string) {
		const v = await this.db.get<T>(k);
		return v ?? null;
	}

	async setItem<T>(k: string, v: T) {
		return await this.db.set<T>(k, v);
	}

	async deleteItem(k: string) {
		return await this.db.delete(k);
	}
}
