import { useComponentTheme } from "@inkjs/ui";
import { Box, Text } from "ink";
import figures from "figures";
import type { ReactNode } from "react";

import type { Theme } from "./theme.js";

export type SelectOptionProps = {
	readonly isFocused: boolean;
	readonly isSelected: boolean;
	readonly children: ReactNode;
};

export function SelectOption({
	children,
	isFocused,
	isSelected,
}: SelectOptionProps) {
	const { styles } = useComponentTheme<Theme>("Select");

	return (
		<Box {...styles.option({ isFocused })}>
			{isFocused && <Text {...styles.focusIndicator()}>{figures.pointer}</Text>}
			<Text {...styles.label({ isFocused, isSelected })}>{children}</Text>
		</Box>
	);
}
