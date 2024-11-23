import { createContext, type PropsWithChildren } from "react";

import LocalParamStore from "./LocalParamStore.js";

export const AnonParamContext = createContext(
	undefined as unknown as LocalParamStore,
);

export const AnonParamProvider = ({ children }: PropsWithChildren) => {
	const localParams = new LocalParamStore();
	return (
		<AnonParamContext.Provider value={localParams}>
			{children}
		</AnonParamContext.Provider>
	);
};
