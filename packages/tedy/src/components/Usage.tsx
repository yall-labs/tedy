import { Text } from "ink";
import { useTimeAgo } from "react-time-ago";

import {
	YOU,
	type LastUsed,
	type LastUsedItem,
} from "../state/LastUsed.type.js";

function formatUsage(usage: LastUsed | undefined) {
	let amount = 0;
	let lastUsed = undefined;
	let user: string | typeof YOU | undefined = undefined;

	if (usage && usage.length > 0) {
		for (const u of usage) {
			amount += u.amount;

			if (
				(!lastUsed && u.lastUsed && u.lastUsed > 0) ||
				(lastUsed && u.lastUsed && u.lastUsed > lastUsed)
			) {
				lastUsed = u.lastUsed;
				user = u.user;
			}
		}
	}

	return {
		amount,
		lastUsed,
		user: user as string | typeof YOU | undefined,
	} satisfies LastUsedItem;
}

export function Usage({ usage }: { usage?: LastUsed }) {
	const { amount, lastUsed, user } = formatUsage(usage);
	const userIsYou = user === YOU;

	const { formattedDate } = useTimeAgo({
		date: lastUsed ?? 0,
		locale: "en",
	});

	return !lastUsed ? (
		<Text dimColor>Has not been used yet.</Text>
	) : (
		<Text>
			Used {amount} times. Last used by{" "}
			{userIsYou ? "you" : "" /* TODO: identify team members (by email) */},{" "}
			{formattedDate}.
		</Text>
	);
}
