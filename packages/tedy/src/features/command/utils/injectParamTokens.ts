import type { ParamToken } from "../../../state/Param.type.js";
import type { StringWithId } from "../../param/utils/compileParams.js";

export function injectParamTokens(script: string, params: Array<ParamToken>) {
	let partial = script;
	const scriptWithParams: Array<StringWithId | ParamToken> = [];

	let stringIds = 0;

	for (const param of params) {
		const splitPoint = partial.indexOf(param.raw);
		const left = partial.substring(0, splitPoint);
		partial = partial.substring(splitPoint + param.raw.length);

		if (left.length > 0) {
			scriptWithParams.push({ value: left, id: `param-text-${stringIds++}` });
		}

		scriptWithParams.push(param);
	}

	if (partial.length > 0) {
		scriptWithParams.push({ value: partial, id: `param-text-${stringIds++}` });
	}

	return scriptWithParams;
}
