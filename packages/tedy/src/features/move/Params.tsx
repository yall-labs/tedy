import { Spinner } from "@inkjs/ui";
import { MultiSelect } from "@yall-labs/multi-select";
import { Newline, Text } from "ink";
import figures from "figures";
import { useCallback, useContext, useEffect, useState } from "react";

import { Exit } from "../../components/Exit.js";
import { db, id } from "../../instant/index.js";
import { useAnonParams } from "../param/hooks/useAnonParams.js";
import { useLocalParams } from "../param/hooks/useLocalParams.js";
import type { Param } from "../../state/Param.type.js";
import { AnonParamContext } from "../../state/AnonParamProvider.js";
import { LocalParamsContext } from "../../state/LocalProviders.js";

const steps = [
	"remoteInitial",
	"remote",
	"moveRemote",
	"noParams",
	"localInitial",
	"local",
	"moveLocal",
	"quitting",
] as const;
type Step = (typeof steps)[number];

export function Params() {
	const { user } = db.useAuth();
	const anonStore = useContext(AnonParamContext);
	const paramStore = useContext(LocalParamsContext);
	const { isLoadingParams, localParams } = useLocalParams();
	const [currentStep, setCurrentStep] = useState<Step>("remoteInitial");
	const { isLoading: isLoadingRemoteParams, data } = db.useQuery({
		params: {},
	});
	const { isLoadingAnonParams, anonParams } = useAnonParams(
		currentStep === "remoteInitial" || currentStep === "localInitial",
	);
	const isLoading =
		isLoadingAnonParams || isLoadingParams || isLoadingRemoteParams;
	const cloudParamNames = data?.params.map(({ name }) => name) || [];
	const [movableParams, setMovableParams] = useState<Array<Param>>([]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: prevent unnecessary re-renders
	const moveParams = useCallback(
		async (paramsToMove: Array<[string, number]>, isRemote?: boolean) => {
			const txs = [];
			for await (const [name] of paramsToMove) {
				const localParam = anonParams.find(
					({ name: anonName }) => anonName === name,
				) as Param;

				if (isRemote) {
					txs.push(
						// TODO: fix type
						// biome-ignore lint/style/noNonNullAssertion: in need of library fix
						db.tx.params[id()]!.update({
							name,
							value: localParam?.value,
							static: localParam?.static || true, // TODO: remove hard cast to static
						}).link({ user: user?.id }),
					);
				} else {
					await paramStore.setParam(name, {
						value: localParam?.value,
						static: localParam?.static,
						usage: [{ amount: 0, lastUsed: undefined }],
					});
				}
			}

			if (isRemote) {
				await db.transact(txs);
			}

			for await (const [name, shouldKeep] of paramsToMove) {
				if (shouldKeep === 0) {
					await anonStore.deleteParam(name);
				}
			}

			setCurrentStep(isRemote ? "localInitial" : "quitting");
		},
		[anonParams],
	);

	useEffect(() => {
		if (
			currentStep === "remoteInitial" &&
			!isLoading &&
			anonParams.length === 0
		) {
			setCurrentStep("noParams");
		} else if (
			currentStep === "remoteInitial" &&
			!isLoading &&
			anonParams.length > 0 &&
			movableParams.length === 0
		) {
			const _movableParams = anonParams.filter(
				({ name, static: isStatic }) =>
					isStatic && !cloudParamNames.includes(name),
			);

			if (_movableParams.length > 0) {
				setMovableParams(_movableParams);
				setCurrentStep("remote");
			} else {
				setCurrentStep("localInitial");
			}
		}
	}, [isLoading, anonParams, currentStep, movableParams, cloudParamNames]);

	useEffect(() => {
		if (currentStep === "localInitial") {
			if (isLoading && movableParams.length > 0) {
				setMovableParams([]);
			} else if (!isLoading && anonParams.length === 0) {
				setCurrentStep("quitting");
			} else if (
				!isLoading &&
				anonParams.length > 0 &&
				movableParams.length === 0
			) {
				const _movableParams = anonParams.filter(
					({ name }) => !localParams.includes(name),
				);

				if (_movableParams.length > 0) {
					setMovableParams(_movableParams);
					setCurrentStep("local");
				} else {
					setCurrentStep("quitting");
				}
			}
		}
	}, [isLoading, anonParams, currentStep, movableParams, localParams]);

	if (
		isLoading ||
		currentStep === "remoteInitial" ||
		currentStep === "localInitial" ||
		currentStep === "moveRemote" ||
		currentStep === "moveLocal"
	) {
		return <Spinner />;
	}

	if (currentStep === "remote" || currentStep === "local") {
		const isRemote = currentStep === "remote";
		return (
			<>
				<Text>
					The following params were made without an account.
					<Newline />
					They can be moved or copied to your account's{" "}
					{isRemote ? "cloud" : "local"} store, and will be callable using{" "}
					<Text color="yellow" bold>
						{isRemote ? "tedy.{name}" : "local.{name}"}
					</Text>
					.
					<Newline />
					<Text dimColor>
						For the moved or copied params, usage stats will be reset.
					</Text>
					<Newline />
					<Newline />
					<Text>
						<Text color="green">{figures.bullet}</Text> will move the param{" "}
						<Text dimColor>(This will clean up the anonymous store)</Text>
					</Text>
					<Newline />
					<Text>
						<Text color="yellow">{figures.bullet}</Text> will copy the param{" "}
						<Text dimColor>(This will not clean up the anonymous store)</Text>
					</Text>
				</Text>
				<MultiSelect
					hasAllOption="Move / copy all params"
					maxStates={2}
					onSubmit={(paramsToMove) => {
						setCurrentStep(isRemote ? "moveRemote" : "moveLocal");
						moveParams(
							paramsToMove.filter(
								([value]) => typeof value === "string",
							) as Array<[string, number]>,
							isRemote,
						);
					}}
					options={movableParams.map(({ name: value }) => ({
						label: value,
						value,
					}))}
				/>
			</>
		);
	}

	return (
		<>
			{movableParams.length === 0 ? (
				<Text>There were no params that could be moved.</Text>
			) : null}
			<Text>Finished moving params.</Text>
			<Exit />
		</>
	);
}
