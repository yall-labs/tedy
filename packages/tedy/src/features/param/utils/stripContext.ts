import type { Context } from "../../../state/Param.type.js";

type StoredContext = Exclude<Context, "runtime" | "unknown">;

export function stripContext(param: string): {
	name: string;
	context: StoredContext;
} {
	const [context, name] = param.split(".") as [string, string];
	return {
		name,
		context: context === "local" ? context : "cloud",
	};
}
