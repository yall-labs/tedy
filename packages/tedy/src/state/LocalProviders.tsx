import { createContext, type PropsWithChildren } from "react";

import LocalParamStore from "./LocalParamStore.js";
import LocalCommandStore from "./LocalCommandStore.js";

export const LocalCommandsContext = createContext(
	undefined as unknown as LocalCommandStore,
);
export const LocalParamsContext = createContext(
	undefined as unknown as LocalParamStore,
);

export const LocalProviders = ({
	userId,
	children,
}: PropsWithChildren<{ userId?: string }>) => {
	const localParams = new LocalParamStore(userId);
	const localCommands = new LocalCommandStore();
	return (
		<LocalParamsContext.Provider value={localParams}>
			<LocalCommandsContext.Provider value={localCommands}>
				{children}
			</LocalCommandsContext.Provider>
		</LocalParamsContext.Provider>
	);
};
