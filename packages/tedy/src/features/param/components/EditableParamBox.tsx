import { ConfirmInput, Spinner, StatusMessage, TextInput } from "@inkjs/ui";
import { Box, Text, useInput } from "ink";
import { useCallback, useMemo, useState } from "react";
import { exit } from "node:process";

import { ParamBox, type SelectedItem } from "./ParamBox.js";
import type { Param } from "../../../state/Param.type.js";
import { defaultUsage, YOU } from "../../../state/LastUsed.type.js";
import { useIsAnon } from "../../auth/hooks/useIsAnon.js";

type Props = {
	label: string;
	isCloud: boolean;
	isLoading: boolean;
	param: Partial<Param>;
	isAlwaysEditing?: boolean;
	selectedItem?: SelectedItem;
	setIsCloud: (value: boolean) => void;
	doesNameExist: (name: string) => boolean;
	onDone: (param: Omit<Param, "context">) => Promise<void>;
};

export function EditableParamBox({
	param,
	onDone,
	isCloud,
	isLoading,
	setIsCloud,
	doesNameExist,
	isAlwaysEditing,
	...props
}: Props) {
	const isAnon = useIsAnon();
	const usage = param.usage ?? [{ ...defaultUsage, user: YOU }];

	const items: Array<SelectedItem> = isCloud // TODO: add static back in should we allow cloud variables
		? isAlwaysEditing
			? ["context", "name", "value", "done"]
			: ["name", "value", "done"]
		: isAlwaysEditing
			? !isAnon
				? ["context", "name", "static", "value", "done"]
				: ["name", "static", "value", "done"]
			: ["name", "static", "value", "done"];

	const [isEditing, setIsEditing] = useState(isAlwaysEditing);
	const [name, setName] = useState<string>(param.name || "");
	const [value, setValue] = useState<string>(param.value || "");
	const [isStatic, setIsStatic] = useState<boolean>(param.static || false);
	const [selectedItem, setSelectedItem] = useState<SelectedItem>(
		props.selectedItem || isAnon ? "name" : "context",
	);

	const itemIndex = items.findIndex((item) => item === selectedItem);
	const exists = useMemo(() => {
		return doesNameExist(name);
	}, [doesNameExist, name]);

	const persist = useCallback(async () => {
		await onDone({
			name,
			value,
			usage,
			static: isStatic,
		});

		exit();
	}, [onDone, name, value, usage, isStatic]);

	const cycleSelectedItem = useCallback(
		(direction: "up" | "down") => {
			if (direction === "up" && itemIndex === 0) {
				setSelectedItem(items[items.length - 1] as SelectedItem);
			} else if (direction === "up") {
				setSelectedItem(items[itemIndex - 1] as SelectedItem);
			} else if (direction === "down" && itemIndex === items.length - 1) {
				setSelectedItem(items[0] as SelectedItem);
			} else if (direction === "down") {
				setSelectedItem(items[itemIndex + 1] as SelectedItem);
			}
		},
		[itemIndex, items],
	);

	useInput(
		(_input, key) => {
			if (key.downArrow) {
				cycleSelectedItem("down");
			}

			if (key.upArrow) {
				cycleSelectedItem("up");
			}

			if (key.return) {
				setIsEditing(true);
			}
		},
		{ isActive: !isEditing },
	);

	return (
		<>
			<ParamBox
				editable
				{...props}
				name={name}
				value={value}
				usage={usage}
				static={isStatic}
				selectedItem={selectedItem}
				context={isCloud ? "cloud" : "local"}
			/>
			{isEditing && !isAnon && selectedItem === "context" && (
				<Box flexDirection="row" gap={1}>
					<Text>
						Store <Text bold>{name || "param"}</Text> remotely?
					</Text>
					<ConfirmInput
						defaultChoice={isCloud ? "confirm" : "cancel"}
						onCancel={() => {
							if (isAlwaysEditing) {
								cycleSelectedItem("down");
							} else {
								setIsEditing(false);
							}
							setIsCloud(false);
						}}
						onConfirm={() => {
							if (isAlwaysEditing) {
								cycleSelectedItem("down");
							} else {
								setIsEditing(false);
							}
							setIsCloud(true);
							setIsStatic(true);
						}}
					/>
				</Box>
			)}
			{isEditing && selectedItem === "name" && (
				<Box flexDirection="row" justifyContent="flex-start">
					<Box width={1} height={1} marginRight={1}>
						{(name.length === 0 || isLoading) && <Spinner />}
						{name.length > 0 &&
							!isLoading &&
							(exists ? (
								<StatusMessage variant="error">{""}</StatusMessage>
							) : (
								<StatusMessage variant="success">{""}</StatusMessage>
							))}
					</Box>
					<Box flexGrow={1}>
						<TextInput
							defaultValue={name}
							placeholder="Please give your param a name"
							onChange={setName}
							onSubmit={() => {
								if (name.length < 1 || exists) {
								} else {
									if (isAlwaysEditing) {
										cycleSelectedItem("down");
									} else {
										setIsEditing(false);
									}
								}
							}}
						/>
					</Box>
				</Box>
			)}
			{isEditing && selectedItem === "value" && (
				<TextInput
					defaultValue={value}
					placeholder="Give your param a value"
					onChange={setValue}
					onSubmit={() => {
						if (value.length > 0 && isAlwaysEditing) {
							cycleSelectedItem("down");
						} else if (value.length > 0) {
							setIsEditing(false);
						}
					}}
				/>
			)}
			{isEditing && !isCloud && selectedItem === "static" && (
				<Box flexDirection="row" gap={1}>
					<Text>
						Should <Text bold>{name}</Text> be static?
					</Text>
					<ConfirmInput
						defaultChoice={isStatic ? "confirm" : "cancel"}
						onCancel={() => {
							if (isAlwaysEditing) {
								cycleSelectedItem("down");
							} else {
								setIsEditing(false);
							}
							setIsStatic(false);
						}}
						onConfirm={() => {
							if (isAlwaysEditing) {
								cycleSelectedItem("down");
							} else {
								setIsEditing(false);
							}
							setIsStatic(true);
						}}
					/>
				</Box>
			)}
			{isEditing && selectedItem === "done" && (
				<Box flexDirection="row" gap={1}>
					<Text>
						{props.label} <Text bold>{name}</Text>?
					</Text>
					<ConfirmInput
						defaultChoice="confirm"
						onCancel={() => {
							if (isAlwaysEditing) {
								exit();
							} else {
								setIsEditing(false);
							}
						}}
						onConfirm={persist}
					/>
				</Box>
			)}
		</>
	);
}
