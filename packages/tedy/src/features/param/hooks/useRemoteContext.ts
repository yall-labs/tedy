import { useContext } from "react";
import type { ArrayValues } from "type-fest";

import { db } from "../../../instant/index.js";
import type { Param } from "../../../state/Param.type.js";
import { FlagsContext } from "../../../state/FlagsContext.js";

export function useRemoteContext() {
	const { user } = db.useAuth();
	const { team } = useContext(FlagsContext);

	const noopRemoteContext = {
		async getParam(_name: string) {
			return undefined;
		},
	};

	const authenticatedContext = {
		async getParam(name: string) {
			const { data } = await db.queryOnce(
				team
					? {
							teams: { params: { $: { where: { name } } } },
						}
					: {
							params: { $: { where: { name, user: user?.id as string } } },
						},
			);

			const params: NonNullable<typeof data.params> =
				(team ? data?.teams?.[0]?.params : data.params) || [];

			if (params.length < 1) {
				return undefined;
			}

			const { id, value } = params[0] as ArrayValues<
				NonNullable<typeof data.params>
			>;
			return {
				id,
				name,
				value,
				context: "cloud",
				usage: [], // temp
				static: true, // temp
			} satisfies Param;
		},
	};

	return !user ? noopRemoteContext : authenticatedContext;
}
