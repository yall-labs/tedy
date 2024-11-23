import { Spinner } from "@inkjs/ui";
import { Select } from "@yall-labs/ink-select";
import { Text } from "ink";
import { useNavigate } from "react-router-dom";

import { useLocalCommands } from "../hooks/useLocalCommands.js";
import { Exit } from "../../../components/Exit.js";
import { db } from "../../../instant/index.js";
import { useIsAnon } from "../../auth/hooks/useIsAnon.js";
import { useContext } from "react";
import { FlagsContext } from "../../../state/FlagsContext.js";

type AllCommandsParams = {
	action: string;
	isLoading: boolean;
	authenticated: boolean;
	commandsMap: Array<{ label: string; value: string }>;
};
type AllCommandsAction = Pick<AllCommandsParams, "action">;

export function AllCommandsAction({ action }: AllCommandsAction) {
	const isAnon = useIsAnon();
	const { team } = useContext(FlagsContext);
	const Component = isAnon
		? AllCommandsAnon
		: team
			? AllCommandsTeam
			: AllCommandsAuth;
	return <Component action={action} />;
}

function AllCommandsBody({
	action,
	isLoading,
	authenticated,
	commandsMap,
}: AllCommandsParams) {
	const navigate = useNavigate();

	if (isLoading) {
		return <Spinner label="Fetching commands" />;
	}

	if (!commandsMap.length) {
		return (
			<>
				<Text>
					Couldn't find any commands, try
					{!authenticated ? " logging in or " : " "}creating one using{" "}
					<Text color="yellow">tedy command add</Text>
				</Text>
				<Exit />
			</>
		);
	}

	return (
		<Select
			options={commandsMap}
			onChange={(name) => navigate(`${action}${name}`)}
		/>
	);
}

function AllCommandsTeam({ action }: AllCommandsAction) {
	// TODO: error handling
	const { isLoading, data } = db.useQuery({
		teams: {
			commands: {},
		},
	});

	// if (data?.teams.length === 0) {} // show error that you're not in a team yet

	const commandsMap =
		data?.teams[0]?.commands.map(({ name }) => ({
			label: name,
			value: name,
		})) ?? [];

	return (
		<AllCommandsBody
			authenticated
			action={action}
			isLoading={isLoading}
			commandsMap={commandsMap}
		/>
	);
}

function AllCommandsAuth({ action }: AllCommandsAction) {
	const { user } = db.useAuth();
	// TODO: error handling
	const { isLoading, data } = db.useQuery({
		commands: {
			$: {
				where: {
					user: user?.id as string,
				},
			},
		},
	});

	const commandsMap =
		data?.commands.map(({ name }) => ({
			label: name,
			value: name,
		})) ?? [];

	return (
		<AllCommandsBody
			authenticated
			action={action}
			isLoading={isLoading}
			commandsMap={commandsMap}
		/>
	);
}

function AllCommandsAnon({ action }: AllCommandsAction) {
	const { commands, isLoadingCommands: isLoading } = useLocalCommands();
	const commandsMap = commands.map((command) => ({
		label: command,
		value: command,
	}));

	return (
		<AllCommandsBody
			action={action}
			authenticated={false}
			isLoading={isLoading}
			commandsMap={commandsMap}
		/>
	);
}
