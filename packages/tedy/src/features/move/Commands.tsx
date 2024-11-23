import { ConfirmInput, Spinner } from "@inkjs/ui";
import { MultiSelect } from "@yall-labs/multi-select";
import { Box, Newline, Text } from "ink";
import figures from "figures";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Exit } from "../../components/Exit.js";
import { db, id } from "../../instant/index.js";
import { useLocalCommands } from "../command/hooks/useLocalCommands.js";
import { LocalCommandsContext } from "../../state/LocalProviders.js";

const steps = ["initial", "deleting", "alsoParams", "quitting"] as const;
type Step = (typeof steps)[number];

export function Commands() {
	const navigate = useNavigate();
	const { user } = db.useAuth();
	const { isLoading: isLoadingRemoteCommands, data } = db.useQuery({
		commands: {},
	});
	const commandStore = useContext(LocalCommandsContext);
	const { isLoadingCommands, commands: localCommands } = useLocalCommands();
	const [movableCommands, setMovableCommands] = useState<Array<string>>([]);
	const [currentStep, setCurrentStep] = useState<Step>("initial");
	const cloudCommandNames = data?.commands.map(({ name }) => name) || [];
	const isLoading = isLoadingCommands || isLoadingRemoteCommands;

	// biome-ignore lint/correctness/useExhaustiveDependencies: prevent unnecessary re-renders
	const moveCommands = useCallback(
		async (commandsToMove: Array<[string, number]>) => {
			const txs = [];
			for await (const [name] of commandsToMove) {
				const localCommand = await commandStore.getCommand(name);
				txs.push(
					// TODO: fix type
					// biome-ignore lint/style/noNonNullAssertion: in need of library fix
					db.tx.commands[id()]!.update({
						name,
						value: localCommand?.value,
						description: localCommand?.description,
					}).link({ user: user?.id }),
				);
			}

			await db.transact(txs);

			for await (const [name, shouldKeep] of commandsToMove) {
				if (shouldKeep === 0) {
					await commandStore.deleteCommand(name);
				}
			}

			setCurrentStep("alsoParams");
		},
		[],
	);

	useEffect(() => {
		if (currentStep === "initial" && !isLoading && localCommands.length === 0) {
			setCurrentStep("alsoParams");
		} else if (
			currentStep === "initial" &&
			!isLoading &&
			movableCommands.length === 0
		) {
			const _movableCommands = localCommands.filter(
				(name) => !cloudCommandNames.includes(name),
			);

			if (_movableCommands.length > 0) {
				setMovableCommands(_movableCommands);
			} else {
				setCurrentStep("alsoParams");
			}
		}
	}, [
		isLoading,
		currentStep,
		localCommands,
		movableCommands,
		cloudCommandNames,
	]);

	if (isLoading) {
		return <Spinner label="Fetching commands" />;
	}

	if (currentStep === "initial") {
		return (
			<>
				<Text>
					The following commands were made without an account.
					<Newline />
					They can be moved or copied to your account's cloud store.
					<Newline />
					<Text dimColor>
						For the moved or copied commands, usage stats will be reset.
					</Text>
					<Newline />
					<Newline />
					<Text>
						<Text color="green">{figures.bullet}</Text> will move the command{" "}
						<Text dimColor>(This will clean up the anonymous store)</Text>
					</Text>
					<Newline />
					<Text>
						<Text color="yellow">{figures.bullet}</Text> will copy the command{" "}
						<Text dimColor>(This will not clean up the anonymous store)</Text>
					</Text>
				</Text>
				<MultiSelect
					hasAllOption="Move / copy all commands"
					maxStates={2}
					onSubmit={(commandsToMove) => {
						setCurrentStep("deleting");
						moveCommands(
							commandsToMove.filter(
								([value]) => typeof value === "string",
							) as Array<[string, number]>,
						);
					}}
					options={movableCommands.map((value) => ({ label: value, value }))}
				/>
			</>
		);
	}

	if (currentStep === "quitting") {
		return (
			<>
				<Text>Finished moving commands.</Text>
				<Exit />
			</>
		);
	}

	if (currentStep === "alsoParams") {
		return (
			<>
				{movableCommands.length === 0 ? (
					<Text>There were no commands that could be moved.</Text>
				) : (
					<Text>Finished moving commands.</Text>
				)}
				<Box flexDirection="row" gap={1}>
					<Text>Do you want to migrate params?</Text>
					<ConfirmInput
						defaultChoice="confirm"
						onConfirm={() => navigate("/move/params")}
						onCancel={() => {
							setCurrentStep("quitting");
						}}
					/>
				</Box>
			</>
		);
	}

	return <Spinner label="Moving / copying commands" />;
}
