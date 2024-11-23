import type { LastUsed } from "./LastUsed.type.js";

export interface StoredParam {
	value: string;
	static: boolean;
	usage: LastUsed;
}

export function isStoredParam(x: StoredParam | RuntimeParam): x is StoredParam {
	return Object.keys(x).includes("usage");
}

export interface RuntimeParam {
	name: string;
	context: Context;
}

export type Context = "runtime" | "local" | "cloud" | "unknown";

export interface Param extends StoredParam, RuntimeParam {
	id?: string;
}

export type CloudParam = Omit<Param, "context" | "usage"> &
	Partial<Pick<Param, "context" | "usage">>;

export interface ParamToken extends RuntimeParam {
	id: string;
	raw: string;
	default?: string;
	assign?: RuntimeParam;
}
