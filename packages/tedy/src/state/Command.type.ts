import type { LastUsed } from "./LastUsed.type.js";

export type Command = {
	// Generated at runtime
	name: string;
	local?: boolean;

	// Stored
	description?: string;
	value: string;
	usage: LastUsed;
};

export type PartialCommand = Omit<Command, "name" | "local">;
export type CloudCommand = Omit<Command, "usage"> &
	Partial<Pick<Command, "usage">>;
