import { useCallback, useContext } from "react";

import { getFullTokenName, getRuntimeParam } from "../utils/compileParams.js";
import type { ParamToken } from "../../../state/Param.type.js";
import { LocalParamsContext } from "../../../state/LocalProviders.js";
import { defaultUsage } from "../../../state/LastUsed.type.js";

type UpdateParamArguments = {
	epoch: number;
	values: Array<string>;
};

export function useUpdateParams(compiledParams: ParamToken[]) {
	const paramStore = useContext(LocalParamsContext);

	const updateCloudParam = useCallback(
		async (epoch: number, name: string, value: string) => {},
		[],
	);

	const updateLocalParam = useCallback(
		async (epoch: number, name: string, value: string) => {
			const fetchedParam = await paramStore.getParam(name);

			// if (fetchedParam?.static) { // TODO: answer needed - do we auto store local params if they don't exist?
			if (!fetchedParam || fetchedParam?.static) {
				return;
			}

			const usage = fetchedParam?.usage[0] ?? defaultUsage;
			usage.user = undefined;
			usage.amount += 1;
			usage.lastUsed = epoch;

			paramStore.setParam(name, {
				value,
				static: false,
				usage: [usage],
			});
		},
		[paramStore],
	);

	const updateParams = useCallback(
		async ({ epoch, values }: UpdateParamArguments) => {
			if (compiledParams.length < 1) {
				return;
			}

			const mappedParams = compiledParams.map(getFullTokenName);
			const uniqueParams: Array<{ value: string; name: string }> = [];
			for (const param of mappedParams) {
				if (
					uniqueParams.some(({ name }) => param === name) ||
					param.startsWith("unknown#") ||
					param.startsWith("runtime#")
				) {
					continue;
				}

				const index = mappedParams.lastIndexOf(param);
				const value = values[index] as string;
				uniqueParams.push({ value, name: param });
			}

			if (uniqueParams.length < 1) {
				return;
			}

			for await (const uniqueParam of uniqueParams) {
				const param = getRuntimeParam(uniqueParam.name);

				if (param.context === "cloud") {
					await updateCloudParam(epoch, param.name, uniqueParam.value);
				} else {
					await updateLocalParam(epoch, param.name, uniqueParam.value);
				}
			}
		},
		[compiledParams, updateCloudParam, updateLocalParam],
	);

	return updateParams;
}
