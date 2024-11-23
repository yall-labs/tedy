import type { CloudCommand, Command } from "../../../state/Command.type.js";
import { RunScript } from "../../../components/RunScript.js";
import { ParamResolver } from "./ParamResolver.js";
import { RuntimeContext } from "../../param/hooks/useRuntimeContext.js";
import { useCommandBuilder } from "../hooks/useCommandBuilder.js";

export type ResolveStatus = "initial" | "user" | "resolved";

export function RunCommand({ command }: { command: CloudCommand }) {
	const {
		script,
		context,
		isResolved,
		compiledParams,
		setResolvedParam,
		paramsAreResolved,
	} = useCommandBuilder(command);

	return isResolved ? (
		<RunScript script={script} />
	) : (
		<RuntimeContext.Provider value={context}>
			<ParamResolver
				command={command}
				compiledParams={compiledParams}
				setResolvedParam={setResolvedParam}
				paramsAreResolved={paramsAreResolved}
			/>
		</RuntimeContext.Provider>
	);
}
