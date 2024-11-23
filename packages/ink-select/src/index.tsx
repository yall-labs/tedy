import { useComponentTheme, type Option } from "@inkjs/ui";
import { Box, Text } from "ink";
import type { ReactNode } from "react";

import { SelectOption } from "./select-option.js";
import { useSelectState } from "./use-select-state.js";
import { useSelect } from "./use-select.js";
import type { Theme } from "./theme.js";

export type SelectProps = {
	readonly isDisabled?: boolean;
	readonly visibleOptionCount?: number;
	readonly highlightText?: string;
	readonly options: Option[];
	readonly defaultValue?: string;
	readonly onChange?: (value: string) => void;
};

export function Select({
	isDisabled = false,
	visibleOptionCount = 5,
	highlightText: _hightlightText,
	options,
	defaultValue,
	onChange,
}: SelectProps) {
	const state = useSelectState({
		visibleOptionCount,
		options,
		defaultValue,
		onChange,
	});

	useSelect({ isDisabled, state });

	const { styles } = useComponentTheme<Theme>("Select");
	const highlightText = state.filter || _hightlightText;

	return (
		<Box {...styles.container()}>
			{state.visibleOptions.map((option) => {
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

				return (
					<SelectOption
						key={option.value}
						isFocused={!isDisabled && state.focusedValue === option.value}
						isSelected={state.value === option.value}
					>
						{label}
					</SelectOption>
				);
			})}
		</Box>
	);
}
