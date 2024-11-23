import { useCallback, useContext } from "react";

import { EditableCommandBox } from "./components/EditableCommandBox.js";
import { useLocalCommands } from "./hooks/useLocalCommands.js";
import { useIsAnon } from "../auth/hooks/useIsAnon.js";
import { db, id } from "../../instant/index.js";
import type { CloudCommand, Command } from "../../state/Command.type.js";
import { LocalCommandsContext } from "../../state/LocalProviders.js";
import { FlagsContext } from "../../state/FlagsContext.js";

function AddTeam() {
	// TODO: error handling
	const { isLoading, data } = db.useQuery({
		teams: {
			commands: {},
		},
	});

	const team = data?.teams[0];

	const onDone = useCallback(
		async ({ name, value, description }: CloudCommand) => {
			await db.transact([
				// TODO: fix type
				// biome-ignore lint/style/noNonNullAssertion: in need of library fix
				db.tx.commands[id()]!.update({
					name,
					value,
					description,
				}).link({ team: team?.id }),
			]);
		},
		[team?.id],
	);

	const doesNameExist = useCallback(
		(_name: string) => {
			return isLoading
				? false
				: !!team?.commands.some(({ name }) => name === _name);
		},
		[isLoading, team?.commands],
	);

	return (
		<EditableCommandBox
			label="Add"
			isAlwaysEditing
			onDone={onDone}
			command={{ local: false }}
			isLoading={isLoading}
			doesNameExist={doesNameExist}
		/>
	);
}

function AddAuth() {
	const { user } = db.useAuth();
	// TODO: error handling
	const { isLoading, data } = db.useQuery({
		commands: {},
	});

	const onDone = useCallback(
		async ({ name, value, description }: CloudCommand) => {
			await db.transact([
				// TODO: teams
				// TODO: fix type
				// biome-ignore lint/style/noNonNullAssertion: in need of library fix
				db.tx.commands[id()]!.update({
					name,
					value,
					description,
				}).link({ user: user?.id }),
			]);
		},
		[user?.id],
	);

	const doesNameExist = useCallback(
		(_name: string) => {
			return isLoading
				? false
				: !!data?.commands.some(({ name }) => name === _name);
		},
		[isLoading, data?.commands],
	);

	return (
		<EditableCommandBox
			label="Add"
			isAlwaysEditing
			onDone={onDone}
			command={{ local: false }}
			isLoading={isLoading}
			doesNameExist={doesNameExist}
		/>
	);
}

function AddAnon() {
	const commandStore = useContext(LocalCommandsContext);
	const { commands, isLoadingCommands: isLoading } = useLocalCommands();
	const onDone = useCallback(
		async ({ name, value, description }: Omit<Command, "local">) => {
			await commandStore.setCommand(name, {
				value,
				description,
				usage: [{ lastUsed: undefined, amount: 0 }],
			});
		},
		[commandStore.setCommand],
	);

	const doesNameExist = useCallback(
		(_name: string) => {
			return isLoading ? false : commands.includes(_name);
		},
		[isLoading, commands],
	);

	return (
		<EditableCommandBox
			label="Add"
			isAlwaysEditing
			onDone={onDone}
			command={{ local: true }}
			isLoading={isLoading}
			doesNameExist={doesNameExist}
		/>
	);
}

export function Add() {
	const isAnon = useIsAnon();
	const { team } = useContext(FlagsContext);
	const Component = isAnon ? AddAnon : team ? AddTeam : AddAuth;
	return <Component />;
}
