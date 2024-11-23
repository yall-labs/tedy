import { Badge } from "@inkjs/ui";
import { Box, Text } from "ink";
import figures from "figures";

import { BorderedBox } from "../../../components/BorderedBox.js";
import type { Param } from "../../../state/Param.type.js";
import { Usage } from "../../../components/Usage.js";

export type SelectedItem = Exclude<keyof Param, "local"> | "done";
type BoxActions =
	| {
			editable: true;
			label: string;
			selectedItem: SelectedItem;
	  }
	| {
			editable: false;
	  };
type ParamBoxProps = Omit<Param, "usage"> &
	Partial<Pick<Param, "usage">> &
	BoxActions;

export function ParamBox({ name, value, ...props }: ParamBoxProps) {
	const local = props.context === "local";
	const isDone = props.editable && props.selectedItem === "done";
	const isName = props.editable && props.selectedItem === "name";
	const isValue = props.editable && props.selectedItem === "value";
	const isStatic = props.editable && props.selectedItem === "static";
	const isContext = props.editable && props.selectedItem === "context";
	return (
		<BorderedBox>
			<Box gap={1}>
				{(isName || isStatic || isContext) && (
					<Text color="blue">{figures.pointer}</Text>
				)}
				<Text color={isName ? "blue" : undefined}>Param</Text>
				<Text color={isName ? "blue" : "yellow"}>{name}</Text>
				<Badge color={isContext ? "blue" : "green"}>
					{local ? "LOCAL" : "CLOUD"}
				</Badge>
				<Badge color={isStatic ? "blue" : "yellow"}>
					{props.static ? "STATIC" : "VAR"}
				</Badge>
			</Box>
			<Box gap={1}>
				{isValue && <Text color="blue">{figures.pointer}</Text>}
				<Text bold color={isValue ? "blue" : undefined}>
					Value:
				</Text>
				<Text color={isValue ? "blue" : "yellow"}>{value}</Text>
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
