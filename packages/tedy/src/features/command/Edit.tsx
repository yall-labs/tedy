import { Alert, Spinner } from "@inkjs/ui";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { CloudCommand, Command } from "../../state/Command.type.js";
import { LocalCommandsContext } from "../../state/LocalProviders.js";
import { Exit } from "../../components/Exit.js";
import { AllCommandsAction } from "./components/AllCommandsAction.js";
import { EditableCommandBox } from "./components/EditableCommandBox.js";
import { useLocalCommands } from "./hooks/useLocalCommands.js";
import { useIsAnon } from "../auth/hooks/useIsAnon.js";
import { db } from "../../instant/index.js";
import { FlagsContext } from "../../state/FlagsContext.js";

export function EditRoot() {
	return <AllCommandsAction action="/command/edit/" />;
}

type EditParams = {
	name: string;
	updateCommand: (command: Omit<Command, "local">) => Promise<void>;
	doesNameExist: (name: string) => boolean;
	command?: CloudCommand;
	isLoading: boolean;
	isLoadingAllCommands: boolean;
};

type EditName = Pick<EditParams, "name">;

function EditBody({
	name,
	command,
	isLoading,
	doesNameExist,
	updateCommand,
	isLoadingAllCommands,
}: EditParams) {
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
		<EditableCommandBox
			command={command}
			label="Done editing"
			onDone={updateCommand}
			isLoading={isLoadingAllCommands}
			doesNameExist={doesNameExist}
		/>
	);
}

function EditTeam({ name }: EditName) {
	const [rename, setRename] = useState(name);
	const { isLoading, data } = db.useQuery({
		teams: {
			commands: {},
		},
	});

	// const teamId = data?.teams[0]?.id as string; // no team field needed
	const commands: Array<string> =
		(data?.teams[0]?.commands.map(({ name }) => name) as Array<string>) ?? [];
	const command =
		data?.teams[0]?.commands.filter(
			({ name: _name }) => _name === name || _name === rename,
		)[0] ?? undefined;

	const doesNameExist = useCallback(
		(_name: string) => {
			if (_name === name) {
				return false;
			}

			return isLoading ? false : commands.includes(_name);
		},
		[isLoading, commands, name],
	);

	const onDone = useCallback(
		async (data: Omit<Command, "local" | "usage">) => {
			if (!command) {
				return;
			}

			if (
				command.name === data.name &&
				command.description === data.description &&
				command.value === data.value
			) {
				return;
			}

			if (name !== data.name) {
				// Intermediate state to ensure optimistic updates doesn't cancel db persistence
				setRename(data.name);
			}

			await db.transact([
				// TODO: fix type
				// biome-ignore lint/style/noNonNullAssertion: in need of library fix
				db.tx.commands[command.id]!.update({
					name: data.name,
					value: data.value,
					description: data.description,
				}),
			]);

			await db.transact([]); // Flush transactions
		},
		[name, command],
	);

	return (
		<EditBody
			name={name}
			command={command}
			isLoading={isLoading}
			updateCommand={onDone}
			doesNameExist={doesNameExist}
			isLoadingAllCommands={isLoading}
		/>
	);
}

function EditAuth({ name }: EditName) {
	const { user } = db.useAuth();
	const [rename, setRename] = useState(name);
	const { isLoading, data } = db.useQuery({
		commands: {
			$: {
				where: {
					user: user?.id as string,
				},
			},
		},
	});

	const commands: Array<string> =
		(data?.commands.map(({ name }) => name) as Array<string>) ?? [];
	const command =
		data?.commands.filter(
			({ name: _name }) => _name === name || _name === rename,
		)[0] ?? undefined;

	const doesNameExist = useCallback(
		(_name: string) => {
			if (_name === name) {
				return false;
			}

			return isLoading ? false : commands.includes(_name);
		},
		[isLoading, commands, name],
	);

	const onDone = useCallback(
		async (data: Omit<Command, "local" | "usage">) => {
			if (!command) {
				return;
			}

			if (
				command.name === data.name &&
				command.description === data.description &&
				command.value === data.value
			) {
				return;
			}

			if (name !== data.name) {
				// Intermediate state to ensure optimistic updates doesn't cancel db persistence
				setRename(data.name);
			}

			await db.transact([
				// TODO: fix type
				// biome-ignore lint/style/noNonNullAssertion: in need of library fix
				db.tx.commands[command.id]!.update({
					name: data.name,
					value: data.value,
					description: data.description,
				}),
			]);

			await db.transact([]); // Flush transactions
		},
		[name, command],
	);

	return (
		<EditBody
			name={name}
			command={command}
			isLoading={isLoading}
			updateCommand={onDone}
			doesNameExist={doesNameExist}
			isLoadingAllCommands={isLoading}
		/>
	);
}

function EditAnon({ name }: EditName) {
	const commandStore = useContext(LocalCommandsContext);
	const { commands, isLoadingCommands } = useLocalCommands();
	const [command, setCommand] = useState<Command>();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function getCommand(_name: string) {
			const _command = await commandStore.getCommand(_name);
			setCommand(_command);
			setIsLoading(false);
		}

		getCommand(name);
	}, [name, commandStore.getCommand]);

	const doesNameExist = useCallback(
		(_name: string) => {
			if (_name === name) {
				return false;
			}

			return isLoadingCommands ? false : commands.includes(_name);
		},
		[isLoadingCommands, commands, name],
	);

	const onDone = useCallback(
		async ({ name, ...data }: Omit<Command, "local">) => {
			if (!command) {
				return;
			}

			if (
				command.name === name &&
				command.description === data.description &&
				command.value === data.value
			) {
				return;
			}

			(data.usage[0] as { user: undefined }).user = undefined;
			if (command.name === name) {
				await commandStore.setCommand(name, data);
			} else {
				await commandStore.deleteCommand(command.name);
				await commandStore.setCommand(name, data);
			}
		},
		[commandStore.setCommand, commandStore.deleteCommand, command],
	);

	return (
		<EditBody
			name={name}
			command={command}
			isLoading={isLoading}
			updateCommand={onDone}
			doesNameExist={doesNameExist}
			isLoadingAllCommands={isLoadingCommands}
		/>
	);
}

export function Edit() {
	const name = useParams().name as string;
	const isAnon = useIsAnon();
	const { team } = useContext(FlagsContext);
	const Component = isAnon ? EditAnon : team ? EditTeam : EditAuth;
	return <Component name={name} />;
}
