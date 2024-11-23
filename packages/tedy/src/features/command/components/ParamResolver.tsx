import { Spinner, TextInput } from "@inkjs/ui";
import { Box, Text, useFocus, useFocusManager, useInput } from "ink";
import { useEffect, useRef } from "react";

import type { CloudCommand } from "../../../state/Command.type.js";
import { isParamToken } from "../../param/utils/compileParams.js";
import { injectParamTokens } from "../utils/injectParamTokens.js";
import { useGetParam } from "../../param/hooks/useGetParam.js";
import type { ParamToken } from "../../../state/Param.type.js";

type Props = {
	command: CloudCommand;
	paramsAreResolved: () => void;
	compiledParams: Array<ParamToken>;
	setResolvedParam: (id: string, value: string, isStatic?: boolean) => void;
};

function ResolvableParam({
	param,
	resolve,
}: { param: ParamToken; resolve: Props["setResolvedParam"] }) {
	const { isFocused } = useFocus();
	const { focusNext } = useFocusManager();
	const { value, setValue, isLoading, isStatic } = useGetParam(param);
	const valueRef = useRef(value);

	useEffect(() => {
		if (!isLoading && !isFocused && valueRef.current !== value) {
			valueRef.current = value;
			resolve(param.id, value, isStatic);
		}
	}, [isLoading, isStatic, isFocused, value, param.id, resolve]);

	return isLoading ? (
		<Spinner label={isFocused ? "loading" : ""} />
	) : isFocused ? (
		<TextInput defaultValue={value} onChange={setValue} onSubmit={focusNext} />
	) : (
		<Text inverse>{value || `{{${param.name}}}`}</Text>
	);
}

export function ParamResolver({
	command,
	compiledParams,
	setResolvedParam,
	paramsAreResolved,
}: Props) {
	const { isFocused } = useFocus({ autoFocus: true });
	const scriptWithParams = injectParamTokens(command.value, compiledParams);

	useInput(
		(_input, key) => {
			if (key.return) {
				paramsAreResolved();
			}
		},
		{ isActive: isFocused },
	);

	return compiledParams.length ? (
		<Box flexDirection="row">
			{scriptWithParams.map((token) =>
				isParamToken(token) ? (
					<ResolvableParam
						param={token}
						key={token.id}
						resolve={setResolvedParam}
					/>
				) : (
					<Text key={token.id}>{token.value}</Text>
				),
			)}
		</Box>
	) : (
		<></>
	);
}
