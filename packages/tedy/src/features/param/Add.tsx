import { useCallback, useContext, useState } from "react";

import { LocalParamsContext } from "../../state/LocalProviders.js";
import { useLocalParams } from "./hooks/useLocalParams.js";
import { EditableParamBox } from "./components/EditableParamBox.js";
import type { Param } from "../../state/Param.type.js";
import { db, id } from "../../instant/index.js";
import { FlagsContext } from "../../state/FlagsContext.js";

export function Add() {
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
	const { localParams, isLoadingParams } = useLocalParams();

	const paramStore = useContext(LocalParamsContext);
	const [isCloud, setIsCloud] = useState<boolean>(false);
	const onDone = useCallback(
		async ({ name, value, static: s }: Omit<Param, "context">) => {
			if (!isCloud) {
				await paramStore.setParam(name, {
					value,
					static: s,
					usage: [{ amount: 0, lastUsed: undefined }],
				});
			} else {
				await db.transact([
					// TODO: teams
					// TODO: fix type
					// biome-ignore lint/style/noNonNullAssertion: in need of library fix
					db.tx.params[id()]!.update({
						name,
						value,
						static: s,
					}).link(team ? { team: data?.teams?.[0]?.id } : { user: user?.id }),
				]);

				await db.transact([]);
			}
		},
		[isCloud, paramStore.setParam, user?.id, team, data?.teams],
	);

	const doesNameExist = useCallback(
		(_name: string) => {
			if (!isCloud) {
				return isLoadingParams ? false : localParams.includes(_name);
			}

			return isLoading ? false : params.includes(_name);
		},
		[isCloud, isLoadingParams, isLoading, localParams, params],
	);

	return (
		<EditableParamBox
			label="Add"
			onDone={onDone}
			isAlwaysEditing
			isCloud={isCloud}
			setIsCloud={setIsCloud}
			param={{ context: "local" }}
			doesNameExist={doesNameExist}
			isLoading={isCloud ? isLoading : isLoadingParams}
		/>
	);
}
