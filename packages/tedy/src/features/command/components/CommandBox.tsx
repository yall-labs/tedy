import { Badge } from "@inkjs/ui";
import { Box, Text } from "ink";
import figures from "figures";

import { BorderedBox } from "../../../components/BorderedBox.js";
import type { CloudCommand, Command } from "../../../state/Command.type.js";
import { Usage } from "../../../components/Usage.js";

export type SelectedItem = Exclude<keyof Command, "local"> | "done";
type BoxActions =
	| {
			editable: true;
			label: string;
			selectedItem: SelectedItem;
	  }
	| {
			editable: false;
	  };
type CommandBoxProps = CloudCommand & BoxActions;

export function CommandBox({
	name,
	value,
	description,
	local,
	...props
}: CommandBoxProps) {
	const isName = props.editable && props.selectedItem === "name";
	const isValue = props.editable && props.selectedItem === "value";
	const isDescription = props.editable && props.selectedItem === "description";
	const isDone = props.editable && props.selectedItem === "done";
	return (
		<BorderedBox>
			<Box gap={1}>
				{isName && <Text color="blue">{figures.pointer}</Text>}
				<Text color={isName ? "blue" : undefined}>Command</Text>
				<Text color={isName ? "blue" : "yellow"}>{name}</Text>
				<Badge color="green">{local ? "local" : "cloud"}</Badge>
			</Box>
			<Box gap={1}>
				{isValue && <Text color="blue">{figures.pointer}</Text>}
				<Text bold color={isValue ? "blue" : undefined}>
					Value:
				</Text>
				<Text color={isValue ? "blue" : "yellow"}>{value}</Text>
			</Box>
			<Box gap={1}>
				{isDescription && <Text color="blue">{figures.pointer}</Text>}
				<Text bold color={isDescription ? "blue" : undefined}>
					Description:
				</Text>
				<Text
					dimColor={!description}
					color={isDescription ? "blue" : undefined}
				>
					{description || "/"}
				</Text>
			</Box>
			{!props.editable && (
				<Box>
					<Usage usage={props.usage} />
				</Box>
			)}
			{props.editable && (
				<Box gap={1}>
					{isDone && <Text color="blue">{figures.pointer}</Text>}
					<Text bold color={isDone ? "blue" : undefined}>
						{props.label}
					</Text>
				</Box>
			)}
		</BorderedBox>
	);
}
