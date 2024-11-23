import { useCallback, useContext } from "react";

import { LocalCommandsContext } from "../../../state/LocalProviders.js";
import { defaultUsage } from "../../../state/LastUsed.type.js";
import type { CloudCommand } from "../../../state/Command.type.js";

type UpdateCommandArguments = {
	epoch: number;
	command: CloudCommand;
};

export function useUpdateCommand() {
	const commandStore = useContext(LocalCommandsContext);

	const updateCloudCommand = useCallback(
		async (epoch: number, name: string) => {},
		[],
	);

	const updateLocalCommand = useCallback(
		async (epoch: number, name: string) => {
			const fetchedCommand = await commandStore.getCommand(name);

			if (!fetchedCommand) {
				return;
			}

			const usage = fetchedCommand?.usage[0] ?? defaultUsage;
			usage.user = undefined;
			usage.amount += 1;
			usage.lastUsed = epoch;

			commandStore.setCommand(name, {
				...fetchedCommand,
				usage: [usage],
			});
		},
		[commandStore],
	);

	const updateCommand = useCallback(
		async ({ epoch, command }: UpdateCommandArguments) => {
			if (!command.local) {
				await updateCloudCommand(epoch, command.name);
			} else {
				await updateLocalCommand(epoch, command.name);
			}
		},
		[updateCloudCommand, updateLocalCommand],
	);

	return updateCommand;
}
