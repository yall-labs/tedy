import { Alert, Spinner } from "@inkjs/ui";
import { Text } from "ink";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Exit } from "../../components/Exit.js";
import { FlagsContext } from "../../state/FlagsContext.js";
import { LocalCommandsContext } from "../../state/LocalProviders.js";
import type { CloudCommand, Command } from "../../state/Command.type.js";
import { AllCommandsAction } from "./components/AllCommandsAction.js";
import { RunCommand } from "./components/RunCommand.js";
import { useIsAnon } from "../auth/hooks/useIsAnon.js";
import { db } from "../../instant/index.js";

export function RunRoot() {
	// TODO: help page
	return <AllCommandsAction action="/command/run/" />;
}

type RunParams = {
	name: string;
	command?: CloudCommand;
	isLoading: boolean;
};

type RunName = Pick<RunParams, "name">;

function RunBody({ name, isLoading, command }: RunParams) {
	const flags = useContext(FlagsContext);

	if (isLoading) {
		return (
			<>{flags.verbose && <Spinner label={`Fetching command ${name}`} />}</>
		);
	}

	if (!command) {
		return (
			<Alert variant="error">
				Could not find command <Text bold>{name}</Text>
				<Exit code={1} />
			</Alert>
		);
	}

	return (
		<>
			{flags.verbose && (
				<Alert variant="info">
					Running <Text bold>{command.value}</Text>
				</Alert>
			)}
			<RunCommand command={command} />
		</>
	);
}

export function RunTeam({ name }: RunName) {
	const [command, setCommand] = useState<CloudCommand>();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetch() {
			const { data } = await db.queryOnce({
				teams: {
					commands: {
						$: {
							where: {
								name,
							},
						},
					},
				},
			});
			setCommand(data.teams[0]?.commands[0]);
			setIsLoading(false);
		}

		fetch();
	}, [name]);
	return <RunBody name={name} isLoading={isLoading} command={command} />;
}

export function RunWithAuth({ name }: RunName) {
	const { user } = db.useAuth();
	const [command, setCommand] = useState<CloudCommand>();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetch() {
			const { data } = await db.queryOnce({
				commands: {
					$: {
						where: {
							name,
							user: user?.id as string,
						},
					},
				},
			});
			setCommand(data.commands[0]);
			setIsLoading(false);
		}

		fetch();
	}, [name, user?.id]);
	return <RunBody name={name} isLoading={isLoading} command={command} />;
}

export function RunAnonymous({ name }: RunName) {
	const commandStore = useContext(LocalCommandsContext);
	const [command, setCommand] = useState<Command>();
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		async function fetch() {
			const _command = await commandStore.getCommand(name);
			setCommand(_command);
			setIsLoading(false);
		}

		fetch();
	}, [name, commandStore.getCommand]);

	return <RunBody isLoading={isLoading} command={command} name={name} />;
}

export function Run() {
	const name = useParams().name as string;
	const isAnon = useIsAnon();
	const { team } = useContext(FlagsContext);
	const Component = isAnon ? RunAnonymous : team ? RunTeam : RunWithAuth;
	return <Component name={name} />;
}
