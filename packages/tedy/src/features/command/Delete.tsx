import { Alert, ConfirmInput, Spinner } from "@inkjs/ui";
import { Box, Text } from "ink";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Exit } from "../../components/Exit.js";
import type { CloudCommand, Command } from "../../state/Command.type.js";
import { LocalCommandsContext } from "../../state/LocalProviders.js";
import { CommandBox } from "./components/CommandBox.js";
import { FlagsContext } from "../../state/FlagsContext.js";
import { AllCommandsAction } from "./components/AllCommandsAction.js";
import { useIsAnon } from "../auth/hooks/useIsAnon.js";
import { db } from "../../instant/index.js";

type DeleteStatus = "initial" | "not-deleted" | "deleting" | "deleted";

export function DeleteRoot() {
	// TODO: help page
	return <AllCommandsAction action="/command/delete/" />;
}

type DeleteParams = {
	name: string;
	deleteCommand: () => Promise<void>;
	command?: CloudCommand;
	isLoading: boolean;
};

type DeleteName = Pick<DeleteParams, "name">;

function DeleteBody({ name, command, isLoading, deleteCommand }: DeleteParams) {
	const flags = useContext(FlagsContext);
	const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>("initial");

	const deleteAndSetStatus = useCallback(async () => {
		await deleteCommand();
		setDeleteStatus("deleted");
	}, [deleteCommand]);

	if (isLoading) {
		return <Spinner label={`Fetching command ${name}`} />;
	}

	if (deleteStatus === "deleting") {
		return <Spinner label={`Deleting command ${name}`} />;
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
			{!flags.compact && <CommandBox {...command} editable={false} />}
			{deleteStatus === "initial" && (
				<Box flexDirection="row" gap={1}>
					<Text>
						Are you sure you want to delete command <Text bold>{name}</Text>?
					</Text>
					<ConfirmInput
						defaultChoice="cancel"
						onCancel={() => setDeleteStatus("not-deleted")}
						onConfirm={() => {
							setDeleteStatus("deleting");
							deleteAndSetStatus();
						}}
					/>
				</Box>
			)}
			{deleteStatus === "not-deleted" && (
				<>
					<Text>
						Did not delete command <Text bold>{name}</Text>
					</Text>
					<Exit />
				</>
			)}
			{deleteStatus === "deleted" && (
				<>
					<Text>
						Deleted command <Text bold>{name}</Text>
					</Text>
					<Exit />
				</>
			)}
		</>
	);
}

function DeleteTeam({ name }: DeleteName) {
	const [command, setCommand] = useState<{ id: string } & CloudCommand>();
	const [isLoading, setIsLoading] = useState(true);

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

	const deleteCommand = useCallback(async () => {
		if (command) {
			await db.transact([
				// TODO: fix type
				// biome-ignore lint/style/noNonNullAssertion: in need of library fix
				db.tx.commands[command.id]!.delete(),
			]);
		}

		await db.transact([]); // flush open transactions
		// TODO: open ticket with instant to see if / why this is needed?
	}, [command]);

	return (
		<DeleteBody
			name={name}
			command={command}
			deleteCommand={deleteCommand}
			isLoading={isLoading}
		/>
	);
}

function DeleteAuth({ name }: DeleteName) {
	const { user } = db.useAuth();
	const [command, setCommand] = useState<{ id: string } & CloudCommand>();
	const [isLoading, setIsLoading] = useState(true);

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

	const deleteCommand = useCallback(async () => {
		if (command) {
			await db.transact([
				// TODO: fix type
				// biome-ignore lint/style/noNonNullAssertion: in need of library fix
				db.tx.commands[command.id]!.delete(),
			]);
		}

		await db.transact([]); // flush open transactions
		// TODO: open ticket with instant to see if / why this is needed?
	}, [command]);

	return (
		<DeleteBody
			name={name}
			command={command}
			deleteCommand={deleteCommand}
			isLoading={isLoading}
		/>
	);
}

function DeleteAnon({ name }: DeleteName) {
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

	const deleteCommand = useCallback(async () => {
		await commandStore.deleteCommand(name);
	}, [name, commandStore.deleteCommand]);

	return (
		<DeleteBody
			name={name}
			command={command}
			deleteCommand={deleteCommand}
			isLoading={isLoading}
		/>
	);
}

export function Delete() {
	const name = useParams().name as string;
	const isAnon = useIsAnon();
	const { team } = useContext(FlagsContext);
	const Component = isAnon ? DeleteAnon : team ? DeleteTeam : DeleteAuth;
	return <Component name={name} />;
}
