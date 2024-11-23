import { useContext, useEffect, useState } from "react";

import { AnonParamContext } from "../../../state/AnonParamProvider.js";
import type { Param } from "../../../state/Param.type.js";
import { stripContext } from "../utils/stripContext.js";

export function useAnonParams(shouldFetch: boolean) {
	const paramStore = useContext(AnonParamContext);
	const [isLoadingAnonParams, setIsLoadingParams] = useState(true);
	const [params, setParams] = useState<Array<Param>>([]);
	useEffect(() => {
		async function prefillLocalParams() {
			const paramNames = await paramStore.getAllParams();
			const _params: Array<Param> = [];

			for await (const _name of paramNames) {
				const { name } = stripContext(_name);
				const param = await paramStore.getParam(name);
				_params.push(param as Param);
			}

			setParams(_params);
			setIsLoadingParams(false);
		}

		if (shouldFetch) {
			setIsLoadingParams(true);
			prefillLocalParams();
		}
	}, [paramStore.getAllParams, paramStore.getParam, shouldFetch]);

	return {
		anonParams: params,
		isLoadingAnonParams,
	};
}
