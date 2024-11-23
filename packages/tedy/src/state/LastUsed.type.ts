export const YOU = Symbol("you"); // only used locally when fetching params/commands

export const defaultUsage: LastUsedItem = {
	amount: 0,
	lastUsed: undefined,
};

export type LastUsedItem = {
	amount: number;
	user?: string | typeof YOU; // optionally typed, you can't serialize a symbol
	lastUsed: number | undefined; // epoch
};

export type LastUsed = Array<LastUsedItem>;

export function appendSymbolToUsage(storedValue: LastUsed): LastUsed {
	// We know stored values only have one usage item in their array, so we can safely append these.
	const mutatedValue = Array.from(storedValue) as [LastUsedItem, ...LastUsed];
	mutatedValue[0].user = YOU;
	return mutatedValue;
}
