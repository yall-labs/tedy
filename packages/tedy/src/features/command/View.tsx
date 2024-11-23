import { Alert, Spinner } from "@inkjs/ui";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { CloudCommand, Command } from "../../state/Command.type.js";
import { LocalCommandsContext } from "../../state/LocalProviders.js";
import { Exit } from "../../components/Exit.js";
import { AllCommandsAction } from "./components/AllCommandsAction.js";
import { CommandBox } from "./components/CommandBox.js";
import { useIsAnon } from "../auth/hooks/useIsAnon.js";
import { db } from "../../instant/index.js";
import { FlagsContext } from "../../state/FlagsContext.js";

export function ViewRoot() {
	// TODO: help page
	return <AllCommandsAction action="/command/view/" />;
}

type ViewParams = {
	name: string;
	isLoading: boolean;
	command?: CloudCommand;
};

type ViewName = Pick<ViewParams, "name">;

function ViewBody({ isLoading, command, name }: ViewParams) {
	if (isLoading) {
		return <Spinner label={`Fetching command ${name}`} />;
	}

	if (!command) {
		return (
			<>
				<Alert variant="error">Unable to find command {name}</Alert>
				<Exit code={1} />
			</>
		);
	}

	return (
		<>
			<CommandBox {...command} editable={false} />
			<Exit />
		</>
	);
}

function ViewTeam({ name }: ViewName) {
	const [command, setCommand] = useState<CloudCommand>();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function getCommand() {
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

		getCommand();
	}, [name]);

	return <ViewBody name={name} command={command} isLoading={isLoading} />;
}

function ViewAuth({ name }: ViewName) {
	const { user } = db.useAuth();
	const [command, setCommand] = useState<CloudCommand>();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function getCommand() {
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

		getCommand();
	}, [name, user?.id]);

	return <ViewBody name={name} command={command} isLoading={isLoading} />;
}

function ViewAnon({ name }: ViewName) {
	const commandStore = useContext(LocalCommandsContext);
	const [command, setCommand] = useState<Command>();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function getCommand() {
			const _command = await commandStore.getCommand(name);
			setCommand(_command);
			setIsLoading(false);
		}

		getCommand();
	}, [name, commandStore.getCommand]);

	return <ViewBody name={name} command={command} isLoading={isLoading} />;
}

export function View() {
	const name = useParams().name as string;
	const isAnon = useIsAnon();
	const { team } = useContext(FlagsContext);
	const Component = isAnon ? ViewAnon : team ? ViewTeam : ViewAuth;
	return <Component name={name} />;
}
