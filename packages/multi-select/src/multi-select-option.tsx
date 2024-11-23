import { Box, Text } from "ink";
import figures from "figures";
import type { ReactNode } from "react";

import theme from "./theme.js";
import type { MultiSelectTuple } from "./use-multi-select-state.js";

export type MultiSelectOptionProps = {
	readonly isFocused: boolean;
	readonly selectedState: MultiSelectTuple | undefined;
	readonly children: ReactNode;
};

export function MultiSelectOption({
	children,
	isFocused,
	selectedState,
}: MultiSelectOptionProps) {
	const { styles } = theme;

	return (
		<Box {...styles.option({ isFocused })}>
			{isFocused && <Text {...styles.focusIndicator()}>{figures.pointer}</Text>}

			{selectedState ? (
				<Text {...styles.selectedIndicator(selectedState[1])}>
					{figures.bullet}
				</Text>
			) : (
				<Text>{figures.radioOff}</Text>
			)}

			<Text {...styles.label({ isFocused, selectedState: selectedState?.[1] })}>
				{children}
			</Text>
		</Box>
	);
}
