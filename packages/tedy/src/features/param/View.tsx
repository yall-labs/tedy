import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { LocalParamsContext } from "../../state/LocalProviders.js";
import { Alert, Spinner } from "@inkjs/ui";
import { Exit } from "../../components/Exit.js";
import { AllParamsAction } from "./components/AllParamsAction.js";
import { ParamBox } from "./components/ParamBox.js";
import type { Param } from "../../state/Param.type.js";
import { stripContext } from "./utils/stripContext.js";
import { useRemoteContext } from "./hooks/useRemoteContext.js";

export function ViewRoot() {
	return <AllParamsAction action="/param/view/" />;
}

export function View() {
	const paramStore = useContext(LocalParamsContext);
	const remoteContext = useRemoteContext();
	const { name, context } = stripContext(useParams().name as string);
	const [param, setParam] = useState<Param>();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function getParam(_name: string) {
			const _param = await (context === "cloud"
				? remoteContext.getParam(_name)
				: paramStore.getParam(_name));

			setParam(_param);
			setIsLoading(false);
		}

		if (!param) {
			getParam(name);
		}
	}, [name, paramStore.getParam, remoteContext.getParam, context, param]);

	if (isLoading) {
		return <Spinner label={`Fetching param ${name}`} />;
	}

	if (!param) {
		return (
			<>
				<Alert variant="error">Unable to find param {name}</Alert>
				<Exit code={1} />
			</>
		);
	}

	return (
		<>
			<ParamBox {...param} editable={false} />
			<Exit />
		</>
	);
}
