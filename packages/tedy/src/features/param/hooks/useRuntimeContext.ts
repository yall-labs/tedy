import { createContext, useContext } from "react";

import {
	getFullTokenName,
	type RuntimeContextState,
} from "../utils/compileParams.js";
import type { RuntimeParam } from "../../../state/Param.type.js";

export const RuntimeContext = createContext({} as RuntimeContextState);

export function useRuntimeContext() {
	const contextMap = useContext(RuntimeContext);

	async function getParam(param: RuntimeParam) {
		return contextMap[getFullTokenName(param)];
	}

	return {
		getParam,
	};
}
