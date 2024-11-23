import { ConfirmInput, Spinner, StatusMessage, TextInput } from "@inkjs/ui";
import { Box, Text, useInput } from "ink";
import { useCallback, useMemo, useState } from "react";
import { exit } from "node:process";

import type { Command } from "../../../state/Command.type.js";
import { CommandBox, type SelectedItem } from "./CommandBox.js";
import { defaultUsage, YOU } from "../../../state/LastUsed.type.js";

type Props = {
	label: string;
	isLoading: boolean;
	command: Partial<Command>;
	isAlwaysEditing?: boolean;
	selectedItem?: SelectedItem;
	doesNameExist: (name: string) => boolean;
	onDone: (command: Omit<Command, "local">) => Promise<void>;
};

export function EditableCommandBox({
	onDone,
	command,
	isLoading,
	doesNameExist,
	isAlwaysEditing,
	...props
}: Props) {
	const usage = command.usage ?? [{ ...defaultUsage, user: YOU }];
	const items: Array<SelectedItem> = ["name", "value", "description", "done"];

	const [value, setValue] = useState<string>(command.value || "");
	const [isEditing, setIsEditing] = useState(isAlwaysEditing);
	const [name, setName] = useState<string>(command.name || "");
	const [description, setDescription] = useState<string>(
		command.description || "",
	);
	const [selectedItem, setSelectedItem] = useState<SelectedItem>(
		props.selectedItem || "value",
	);

	const itemIndex = items.findIndex((item) => item === selectedItem);
	const exists = useMemo(() => {
		return doesNameExist(name);
	}, [doesNameExist, name]);

	const persist = useCallback(async () => {
		await onDone({
			usage,
			name,
			value,
			description,
		});

		exit();
	}, [onDone, usage, name, value, description]);

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
		[itemIndex],
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
			<CommandBox
				editable
				{...props}
				name={name}
				value={value}
				usage={usage}
				local={!!command.local}
				description={description}
				selectedItem={selectedItem}
			/>
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
							placeholder="Please give your command a name"
							onChange={setName}
							onSubmit={() => {
								if (name.length < 1 || exists) {
								} else {
									if (isAlwaysEditing) {
										setSelectedItem("description");
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
					placeholder="Please enter the command you would like to save"
					onChange={setValue}
					onSubmit={() => {
						if (value.length > 0 && isAlwaysEditing) {
							setSelectedItem("name");
						} else if (value.length > 0) {
							setIsEditing(false);
						}
					}}
				/>
			)}
			{isEditing && selectedItem === "description" && (
				<TextInput
					defaultValue={description}
					placeholder="Optionally, give your command a description"
					onChange={setDescription}
					onSubmit={() => {
						if (isAlwaysEditing) {
							setSelectedItem("done");
						} else {
							setIsEditing(false);
						}
					}}
				/>
			)}
			{isEditing && selectedItem === "done" && (
				<Box flexDirection="row" gap={1}>
					<Text>
						{props.label} <Text bold>{name}</Text>?
					</Text>
					<ConfirmInput
						defaultChoice="confirm"
						onCancel={() => {
							if (!isAlwaysEditing) {
								setIsEditing(false);
							} else {
								exit();
							}
						}}
						onConfirm={persist}
					/>
				</Box>
			)}
		</>
	);
}
