import { Alert, ConfirmInput, Spinner } from "@inkjs/ui";
import { Box, Text } from "ink";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Exit } from "../../components/Exit.js";
import { LocalParamsContext } from "../../state/LocalProviders.js";
import { ParamBox } from "./components/ParamBox.js";
import { FlagsContext } from "../../state/FlagsContext.js";
import { AllParamsAction } from "./components/AllParamsAction.js";
import type { Param } from "../../state/Param.type.js";
import { stripContext } from "./utils/stripContext.js";
import { useRemoteContext } from "./hooks/useRemoteContext.js";
import { db } from "../../instant/index.js";

type DeleteStatus = "initial" | "not-deleted" | "deleting" | "deleted";

export function DeleteRoot() {
	// todo: help page
	return <AllParamsAction action="/param/delete/" />;
}

export function Delete() {
	const paramStore = useContext(LocalParamsContext);
	const remoteContext = useRemoteContext();
	const flags = useContext(FlagsContext);
	const { name, context } = stripContext(useParams().name as string);
	const [param, setParam] = useState<Param>();
	const [isLoading, setIsLoading] = useState(true);
	const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>("initial");

	useEffect(() => {
		async function getParam(_name: string) {
			const _param = await (context === "cloud"
				? remoteContext.getParam(_name)
				: paramStore.getParam(_name));

			setParam(_param);
			setIsLoading(false);
		}

		if (!param) {
			getParam(name);
		}
	}, [param, name, paramStore.getParam, remoteContext.getParam, context]);

	const deleteLocalParam = useCallback(
		async (_name: string) => {
			await paramStore.deleteParam(_name);
			setDeleteStatus("deleted");
		},
		[paramStore.deleteParam],
	);

	const deleteCloudParam = useCallback(async () => {
		if (param?.id) {
			await db.transact([
				// TODO: fix type
				// biome-ignore lint/style/noNonNullAssertion: in need of library fix
				db.tx.params[param.id]!.delete(),
			]);

			await db.transact([]); // flush open transactions
			// TODO: open ticket with instant to see if / why this is needed?
		}

		setDeleteStatus("deleted");
	}, [param?.id]);

	if (isLoading) {
		return <Spinner label={`Fetching param ${name}`} />;
	}

	if (deleteStatus === "deleting") {
		return <Spinner label={`Deleting param ${name}`} />;
	}

	if (!param) {
		return (
			<>
				<Alert variant="error">Unable to find param {name}</Alert>
				<Exit code={1} />
			</>
		);
	}

	return (
		<>
			{!flags.compact && <ParamBox {...param} editable={false} />}
			{deleteStatus === "initial" && (
				<Box flexDirection="row" gap={1}>
					<Text>
						Are you sure you want to delete param <Text bold>{name}</Text>?
					</Text>
					<ConfirmInput
						defaultChoice="cancel"
						onCancel={() => setDeleteStatus("not-deleted")}
						onConfirm={() => {
							setDeleteStatus("deleting");
							if (context === "cloud") {
								deleteCloudParam();
							} else {
								deleteLocalParam(name);
							}
						}}
					/>
				</Box>
			)}
			{deleteStatus === "not-deleted" && (
				<>
					<Text>
						Did not delete param <Text bold>{name}</Text>
					</Text>
					<Exit />
				</>
			)}
			{deleteStatus === "deleted" && (
				<>
					<Text>
						Deleted param <Text bold>{name}</Text>
					</Text>
					<Exit />
				</>
			)}
		</>
	);
}
