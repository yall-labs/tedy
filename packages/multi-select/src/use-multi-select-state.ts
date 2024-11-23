import OptionMap, { type Option } from "@yall-labs/option-map";
import { isDeepStrictEqual } from "node:util";
import {
	useReducer,
	type Reducer,
	useCallback,
	useMemo,
	useState,
	useEffect,
} from "react";

export const ALL = Symbol("all");
export type MultiSelectTuple = [string | typeof ALL, number];

type State = {
	maxStates: number;
	optionMap: OptionMap<string | typeof ALL>;
	visibleToIndex: number;
	visibleFromIndex: number;
	visibleOptionCount: number;
	value: Array<MultiSelectTuple>;
	previousValue: Array<MultiSelectTuple>;
	focusedValue: string | typeof ALL | undefined;
};

type Action =
	| FocusNextOptionAction
	| FocusPreviousOptionAction
	| ToggleFocusedOptionAction
	| ResetAction;

type FocusNextOptionAction = {
	type: "focus-next-option";
};

type FocusPreviousOptionAction = {
	type: "focus-previous-option";
};

type ToggleFocusedOptionAction = {
	type: "toggle-focused-option";
};

type ResetAction = {
	type: "reset";
	state: State;
};

const reducer: Reducer<State, Action> = (state, action) => {
	switch (action.type) {
		case "focus-next-option": {
			if (!state.focusedValue) {
				return state;
			}

			const item = state.optionMap.get(state.focusedValue);

			if (!item) {
				return state;
			}

			// eslint-disable-next-line prefer-destructuring
			const next = item.next;

			if (!next) {
				return state;
			}

			const needsToScroll = next.index >= state.visibleToIndex;

			if (!needsToScroll) {
				return {
					...state,
					focusedValue: next.value,
				};
			}

			const nextVisibleToIndex = Math.min(
				state.optionMap.size,
				state.visibleToIndex + 1,
			);

			const nextVisibleFromIndex =
				nextVisibleToIndex - state.visibleOptionCount;

			return {
				...state,
				focusedValue: next.value,
				visibleFromIndex: nextVisibleFromIndex,
				visibleToIndex: nextVisibleToIndex,
			};
		}

		case "focus-previous-option": {
			if (!state.focusedValue) {
				return state;
			}

			const item = state.optionMap.get(state.focusedValue);

			if (!item) {
				return state;
			}

			// eslint-disable-next-line prefer-destructuring
			const previous = item.previous;

			if (!previous) {
				return state;
			}

			const needsToScroll = previous.index <= state.visibleFromIndex;

			if (!needsToScroll) {
				return {
					...state,
					focusedValue: previous.value,
				};
			}

			const nextVisibleFromIndex = Math.max(0, state.visibleFromIndex - 1);

			const nextVisibleToIndex =
				nextVisibleFromIndex + state.visibleOptionCount;

			return {
				...state,
				focusedValue: previous.value,
				visibleFromIndex: nextVisibleFromIndex,
				visibleToIndex: nextVisibleToIndex,
			};
		}

		case "toggle-focused-option": {
			if (!state.focusedValue) {
				return state;
			}

			if (state.focusedValue === ALL) {
				const selectedIndex = state.value.findIndex(
					([selectedValue]) => selectedValue === state.focusedValue,
				);

				if (selectedIndex >= 0) {
					const [, _state] = state.value[selectedIndex] as [typeof ALL, number];

					return {
						...state,
						previousValue: state.value,
						value:
							_state < state.maxStates - 1
								? [...state.optionMap.entries()].map(([value]) => [
										value,
										_state + 1,
									])
								: [],
					};
				}

				return {
					...state,
					previousValue: state.value,
					value: [...state.optionMap.entries()].map(([value]) => [value, 0]),
				};
			}

			const selectedIndex = state.value.findIndex(
				([selectedValue]) => selectedValue === state.focusedValue,
			);

			if (selectedIndex >= 0) {
				const [_value, _state] = state.value[selectedIndex] as [string, number];
				const newStateValue = Array.from(state.value);

				if (_state < state.maxStates - 1) {
					newStateValue[selectedIndex] = [_value, _state + 1];
				} else {
					newStateValue.splice(selectedIndex, 1);
				}

				return {
					...state,
					previousValue: state.value,
					value: [...new Set(newStateValue)],
				};
			}

			return {
				...state,
				previousValue: state.value,
				value: [...state.value, [state.focusedValue, 0]],
			};
		}

		case "reset": {
			return action.state;
		}
	}
};

export type UseMultiSelectStateProps = {
	options: Option<string | typeof ALL>[];
	maxStates?: number;
	hasAllOption: string;
	visibleOptionCount?: number;
	defaultValue?: Array<MultiSelectTuple>;
	onChange?: (value: Array<MultiSelectTuple>) => void;
	onSubmit?: (value: Array<MultiSelectTuple>) => void;
};

export type MultiSelectState = Pick<
	State,
	"focusedValue" | "visibleFromIndex" | "visibleToIndex" | "value"
> & {
	visibleOptions: Array<Option<string | typeof ALL> & { index: number }>;
	focusNextOption: () => void;
	focusPreviousOption: () => void;
	toggleFocusedOption: () => void;
	submit: () => void;
};

const createDefaultState = ({
	visibleOptionCount: customVisibleOptionCount,
	defaultValue,
	maxStates,
	options,
}: Pick<
	UseMultiSelectStateProps,
	"visibleOptionCount" | "defaultValue" | "options" | "maxStates"
>): State => {
	const visibleOptionCount =
		typeof customVisibleOptionCount === "number"
			? Math.min(customVisibleOptionCount, options.length)
			: options.length;

	const optionMap = new OptionMap(options);
	const value = defaultValue ?? [];

	return {
		value,
		optionMap,
		visibleOptionCount,
		visibleFromIndex: 0,
		previousValue: value,
		maxStates: maxStates || 1,
		visibleToIndex: visibleOptionCount,
		focusedValue: optionMap.first?.value,
	};
};

export const useMultiSelectState = ({
	options: _options,
	maxStates,
	defaultValue,
	hasAllOption,
	visibleOptionCount = 5,
	onChange,
	onSubmit,
}: UseMultiSelectStateProps) => {
	const options = (
		hasAllOption
			? [{ label: hasAllOption, value: ALL }, ..._options]
			: [_options]
	) as Array<Option<string | typeof ALL>>;
	const [state, dispatch] = useReducer(
		reducer,
		{ visibleOptionCount, defaultValue, options, maxStates },
		createDefaultState,
	);

	const [lastOptions, setLastOptions] = useState(options);

	if (options !== lastOptions && !isDeepStrictEqual(options, lastOptions)) {
		dispatch({
			type: "reset",
			state: createDefaultState({
				options,
				maxStates,
				defaultValue,
				visibleOptionCount,
			}),
		});

		setLastOptions(options);
	}

	const focusNextOption = useCallback(() => {
		dispatch({
			type: "focus-next-option",
		});
	}, []);

	const focusPreviousOption = useCallback(() => {
		dispatch({
			type: "focus-previous-option",
		});
	}, []);

	const toggleFocusedOption = useCallback(() => {
		dispatch({
			type: "toggle-focused-option",
		});
	}, []);

	const submit = useCallback(() => {
		onSubmit?.(state.value);
	}, [state.value, onSubmit]);

	const visibleOptions = useMemo(() => {
		return options
			.map((option, index) => ({
				...option,
				index,
			}))
			.slice(state.visibleFromIndex, state.visibleToIndex);
	}, [options, state.visibleFromIndex, state.visibleToIndex]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: library code
	useEffect(() => {
		if (!isDeepStrictEqual(state.previousValue, state.value)) {
			onChange?.(state.value);
		}
	}, [state.previousValue, state.value, options, onChange]);

	return {
		visibleFromIndex: state.visibleFromIndex,
		visibleToIndex: state.visibleToIndex,
		focusedValue: state.focusedValue,
		value: state.value,
		visibleOptions,
		submit,
		focusNextOption,
		focusPreviousOption,
		toggleFocusedOption,
	} satisfies MultiSelectState;
};
