import { useContext, useEffect, useState } from "react";

import { LocalCommandsContext } from "../../../state/LocalProviders.js";

export function useLocalCommands() {
	const commandStore = useContext(LocalCommandsContext);
	const [isLoadingCommands, setIsLoadingCommands] = useState(true);
	const [commands, setCommands] = useState<Array<string>>(
		commandStore.commands,
	);
	useEffect(() => {
		async function prefillLocalCommands() {
			const _commands = await commandStore.getAllCommands();
			setCommands(_commands);
			setIsLoadingCommands(false);
		}

		prefillLocalCommands();
	}, [commandStore.getAllCommands]);

	return {
		isLoadingCommands,
		commands,
	};
}
