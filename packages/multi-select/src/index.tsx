import { useComponentTheme, type Option } from "@inkjs/ui";
import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { MultiSelectOption } from "./multi-select-option.js";
import {
	useMultiSelectState,
	ALL,
	type MultiSelectTuple,
} from "./use-multi-select-state.js";
import { useMultiSelect } from "./use-multi-select.js";
import type { Theme } from "./theme.js";

export type MultiSelectProps = {
	readonly options: Option[];
	readonly maxStates?: number;
	readonly isDisabled?: boolean;
	readonly hasAllOption?: string;
	readonly highlightText?: string;
	readonly visibleOptionCount?: number;
	readonly defaultValue?: Array<MultiSelectTuple>;
	readonly onSubmit?: (value: Array<MultiSelectTuple>) => void;
	readonly onChange?: (value: Array<MultiSelectTuple>) => void;
};

export function MultiSelect({
	visibleOptionCount = 5,
	isDisabled = false,
	hasAllOption = "",
	maxStates = 1,
	highlightText,
	defaultValue,
	options,
	onSubmit,
	onChange,
}: MultiSelectProps) {
	const state = useMultiSelectState({
		visibleOptionCount,
		hasAllOption,
		defaultValue,
		maxStates,
		options,
		onSubmit,
		onChange,
	});

	useMultiSelect({ isDisabled, state });

	const { styles } = useComponentTheme<Theme>("MultiSelect");

	return (
		<Box {...styles.container()}>
			{state.visibleOptions.map((option) => {
				// eslint-disable-next-line prefer-destructuring
				let label: ReactNode = option.label;

				if (highlightText && option.label.includes(highlightText)) {
					const index = option.label.indexOf(highlightText);

					label = (
						<>
							{option.label.slice(0, index)}
							<Text {...styles.highlightedText()}>{highlightText}</Text>
							{option.label.slice(index + highlightText.length)}
						</>
					);
				}

				const selectedState = state.value.find(
					([value]) => value === option.value,
				);

				return (
					<MultiSelectOption
						selectedState={selectedState}
						isFocused={!isDisabled && state.focusedValue === option.value}
						key={option.value === ALL ? "TEDY_INTERNAL_ALL" : option.value}
					>
						{label}
					</MultiSelectOption>
				);
			})}
		</Box>
	);
}
