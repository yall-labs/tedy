import { Alert, Spinner } from "@inkjs/ui";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { LocalParamsContext } from "../../state/LocalProviders.js";
import { Exit } from "../../components/Exit.js";
import { AllParamsAction } from "./components/AllParamsAction.js";
import { EditableParamBox } from "./components/EditableParamBox.js";
import { useLocalParams } from "./hooks/useLocalParams.js";
import type { Param } from "../../state/Param.type.js";
import { stripContext } from "./utils/stripContext.js";
import { useRemoteContext } from "./hooks/useRemoteContext.js";
import { db } from "../../instant/index.js";
import { FlagsContext } from "../../state/FlagsContext.js";

export function EditRoot() {
	return <AllParamsAction action="/param/edit/" />;
}

export function Edit() {
	const { user } = db.useAuth();
	const { team } = useContext(FlagsContext);
	// TODO: error handling
	const { isLoading, data } = db.useQuery(
		!user
			? {}
			: team
				? { teams: { params: {} } }
				: {
						params: { $: { where: { user: user?.id as string } } },
					},
	);
	const _params = (team ? data?.teams?.[0]?.params : data?.params) || [];
	const params: Array<string> = _params.map(({ name }) => name) || [];
	const paramStore = useContext(LocalParamsContext);
	const { localParams, isLoadingParams } = useLocalParams();
	const remoteContext = useRemoteContext();
	const { name, context } = stripContext(useParams().name as string);
	const [param, setParam] = useState<Param>();
	const [isFetching, setIsFetching] = useState(true);
	const isCloud = context === "cloud";
	const setIsCloud = () => {};

	useEffect(() => {
		async function getParam(_name: string) {
			const _param = await (context === "cloud"
				? remoteContext.getParam(_name)
				: paramStore.getParam(_name));
			setParam(_param);
			setIsFetching(false);
		}

		if (!param) {
			getParam(name);
		}
	}, [name, paramStore.getParam, remoteContext.getParam, context, param]);

	const doesNameExist = useCallback(
		(_name: string) => {
			if (_name === name) {
				return false;
			}

			if (!isCloud) {
				return isLoadingParams ? false : localParams.includes(_name);
			}

			return isLoading ? false : params.includes(_name);
		},
		[isCloud, isLoadingParams, isLoading, params, localParams, name],
	);

	const onDone = useCallback(
		async ({ name, ...data }: Omit<Param, "context">) => {
			if (!param) {
				return;
			}

			if (
				param.name === name &&
				param.static === data.static &&
				param.value === data.value
			) {
				return;
			}

			if (!isCloud) {
				(data.usage[0] as { user: undefined }).user = undefined;
				await paramStore.setParam(name, data);
				if (param.name === name) {
					await paramStore.deleteParam(param.name);
				}
			} else {
				await db.transact([
					// TODO: teams
					// TODO: fix type
					// biome-ignore lint/style/noNonNullAssertion: in need of library fix
					db.tx.params[param.id!]!.update({
						name,
						value: data.value,
						static: data.static,
					}),
				]);

				await db.transact([]);
			}
		},
		[isCloud, paramStore.setParam, paramStore.deleteParam, param],
	);

	if (isFetching) {
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
		<EditableParamBox
			param={param}
			onDone={onDone}
			isCloud={isCloud}
			label="Done editing"
			selectedItem={"value"}
			setIsCloud={setIsCloud}
			doesNameExist={doesNameExist}
			isLoading={isCloud ? isLoading : isLoadingParams}
		/>
	);
}
