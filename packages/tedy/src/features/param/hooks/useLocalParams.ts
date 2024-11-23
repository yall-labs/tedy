import { useContext, useEffect, useState } from "react";

import { LocalParamsContext } from "../../../state/LocalProviders.js";

export function useLocalParams() {
	const paramStore = useContext(LocalParamsContext);
	const [isLoadingParams, setIsLoadingParams] = useState(true);
	const [params, setParams] = useState<Array<string>>(paramStore.params);
	useEffect(() => {
		async function prefillLocalParams() {
			const _params = await paramStore.getAllParams();
			setParams(_params);
			setIsLoadingParams(false);
		}

		prefillLocalParams();
	}, [paramStore.getAllParams]);

	return {
		isLoadingParams,
		localParams: params,
	};
}
