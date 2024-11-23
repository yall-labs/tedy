import { useCallback, useEffect, useRef, useState } from "react";
import { ok, type Result } from "neverthrow";

import type { CloudCommand, Command } from "../../../state/Command.type.js";
import { compileParams } from "../../param/utils/compileParams.js";
import type { ParamToken } from "../../../state/Param.type.js";
import { useUpdateParams } from "../../param/hooks/useUpdateParams.js";
import { useUpdateCommand } from "./useUpdateCommand.js";

function injectParamsInScript(
	_script: string,
	params: Array<ParamToken>,
	values: Array<string | undefined>,
): Result<string, never> {
	let script = _script;

	for (let i = 0; i < params.length; i++) {
		const param = params[i] as ParamToken;
		script = script.replace(param.raw, values[i] || "undefined");
	}

	return ok(script);
}

export function useCommandBuilder(command: CloudCommand) {
	const [script, setScript] = useState(command.value);
	const [isResolved, setIsResolved] = useState(false);
	const [compiledParams, context] = compileParams(command.value);
	const updateCommand = useUpdateCommand();
	const updateParams = useUpdateParams(compiledParams);
	const [staticParams, setStaticParams] = useState(
		new Array<boolean | undefined>(compiledParams.length).fill(undefined),
	);
	const staticAmount = staticParams.filter(
		(param) => typeof param === "boolean",
	).length;

	const resolvedParams = useRef(
		new Array<string | undefined>(compiledParams.length).fill(undefined),
	);

	const setResolvedParam = useCallback(
		(_id: string, value: string, isStatic?: boolean) => {
			const id = Number.parseInt(_id.substring("param-token-".length), 10);
			resolvedParams.current[id] = value.length > 0 ? value : undefined;
			setScript(
				injectParamsInScript(
					command.value,
					compiledParams,
					resolvedParams.current,
				).unwrapOr(""),
			);

			if (isStatic) {
				setStaticParams((_params) => {
					const params = [..._params];
					params[id] = true;
					return params;
				});
			}
		},
		[command.value, compiledParams],
	);

	const paramsAreResolved = useCallback(async () => {
		const hasUnresolvedParams = resolvedParams.current.some(
			(param) => typeof param === "undefined",
		);

		if (!hasUnresolvedParams && !isResolved) {
			const epoch = Date.now();

			await updateCommand({
				epoch,
				command,
			});
			await updateParams({
				epoch,
				values: resolvedParams.current as Array<string>,
			});

			setIsResolved(true);
		}
	}, [updateParams, updateCommand, command, isResolved]);

	useEffect(() => {
		if (staticAmount === compiledParams.length) {
			paramsAreResolved();
		}
	}, [staticAmount, compiledParams.length, paramsAreResolved]);

	return {
		script,
		context,
		isResolved,
		compiledParams,
		setResolvedParam,
		paramsAreResolved,
	};
}
