import { useContext, useEffect, useState } from "react";

import { useRuntimeContext } from "./useRuntimeContext.js";
import { useRemoteContext } from "./useRemoteContext.js";
import { LocalParamsContext } from "../../../state/LocalProviders.js";
import {
	isStoredParam,
	type ParamToken,
	type RuntimeParam,
} from "../../../state/Param.type.js";

export function useGetParam(param: ParamToken) {
	const [isLoading, setIsLoading] = useState(true);
	const [isStatic, setIsStatic] = useState(false);
	const [value, setValue] = useState("");
	const runtimeContext = useRuntimeContext();
	const localContext = useContext(LocalParamsContext);
	const remoteContext = useRemoteContext();

	async function fetchParam(param: RuntimeParam) {
		switch (param.context) {
			case "runtime": {
				return runtimeContext.getParam(param);
			}
			case "local":
				return localContext.getParam(param.name);
			case "cloud":
				return remoteContext.getParam(param.name);
			default:
				return undefined;
		}
	}

	async function resolveFn() {
		let _value = "";
		let _static = false;
		let paramToFetch: RuntimeParam | undefined = param;
		while (paramToFetch) {
			const fetchedParam = await fetchParam(paramToFetch);
			if (!fetchedParam) {
				paramToFetch = undefined;
			} else if (typeof fetchedParam === "string") {
				_value = fetchedParam;
				paramToFetch = undefined;
			} else if (isStoredParam(fetchedParam)) {
				_value = fetchedParam.value;
				_static = param.context !== "runtime" && fetchedParam.static;
				paramToFetch = undefined;
			} else {
				paramToFetch = fetchedParam;
			}
		}

		setValue(_value);
		setIsStatic(_static);
		setIsLoading(false);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: we want this to run initially only
	useEffect(() => {
		resolveFn();
	}, []);

	return {
		value,
		setValue,
		isStatic,
		isLoading,
	};
}
