import { useInput } from "ink";

import type { SelectState } from "./use-select-state.js";

export type UseSelectProps = {
	isDisabled?: boolean;
	state: SelectState;
};

export const useSelect = ({ isDisabled = false, state }: UseSelectProps) => {
	useInput(
		(input, key) => {
			if (key.downArrow) {
				state.focusNextOption();
			}

			if (key.upArrow) {
				state.focusPreviousOption();
			}

			if (key.return) {
				state.selectFocusedOption();
			}

			if (key.backspace || key.delete) {
				state.delete();
			} else {
				state.insert(input);
			}
		},
		{ isActive: !isDisabled },
	);
};
