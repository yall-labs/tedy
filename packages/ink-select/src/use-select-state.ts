import type { Option } from "@inkjs/ui";
import OptionMap from "@yall-labs/option-map";
import { isDeepStrictEqual } from "node:util";
import {
	useReducer,
	type Reducer,
	useCallback,
	useMemo,
	useState,
	useEffect,
} from "react";

type State = {
	filter: string;
	filterPreviousValue: string;
	optionMap: OptionMap<string>;
	visibleOptionCount: number;
	focusedValue: string | undefined;
	visibleFromIndex: number;
	visibleToIndex: number;
	previousValue: string | undefined;
	value: string | undefined;
};

type Action =
	| FocusNextOptionAction
	| FocusPreviousOptionAction
	| SelectFocusedOptionAction
	| ResetAction
	| InsertAction
	| DeleteAction;

type FocusNextOptionAction = {
	type: "focus-next-option";
};

type FocusPreviousOptionAction = {
	type: "focus-previous-option";
};

type SelectFocusedOptionAction = {
	type: "select-focused-option";
};

type ResetAction = {
	type: "reset";
	state: State;
};

type InsertAction = {
	type: "insert";
	text: string;
};

type DeleteAction = {
	type: "delete";
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

		case "select-focused-option": {
			return {
				...state,
				previousValue: state.value,
				value: state.focusedValue,
			};
		}

		case "reset": {
			return action.state;
		}

		case "insert": {
			return {
				...state,
				filterPreviousValue: state.filter,
				filter: state.filter + action.text,
			};
		}

		case "delete": {
			return {
				...state,
				filterPreviousValue: state.filter,
				filter: state.filter.substring(0, state.filter.length - 1),
			};
		}
	}
};

export type UseSelectStateProps = {
	visibleOptionCount?: number;
	options: Option[];
	defaultValue?: string;
	onChange?: (value: string) => void;
};

export type SelectState = Pick<
	State,
	"focusedValue" | "visibleFromIndex" | "visibleToIndex" | "value"
> & {
	visibleOptions: Array<Option & { index: number }>;
	focusNextOption: () => void;
	focusPreviousOption: () => void;
	selectFocusedOption: () => void;
	insert: (text: string) => void;
	delete: () => void;
};

const createDefaultState = ({
	visibleOptionCount: customVisibleOptionCount,
	defaultValue,
	options,
}: Pick<
	UseSelectStateProps,
	"visibleOptionCount" | "defaultValue" | "options"
>) => {
	const visibleOptionCount =
		typeof customVisibleOptionCount === "number"
			? Math.min(customVisibleOptionCount, options.length)
			: options.length;

	const optionMap = new OptionMap(options);

	return {
		filter: "",
		filterPreviousValue: "",
		optionMap,
		visibleOptionCount,
		focusedValue: optionMap.first?.value,
		visibleFromIndex: 0,
		visibleToIndex: visibleOptionCount,
		previousValue: defaultValue,
		value: defaultValue,
	};
};

export const useSelectState = ({
	visibleOptionCount = 5,
	options,
	defaultValue,
	onChange,
}: UseSelectStateProps) => {
	const [state, dispatch] = useReducer(
		reducer,
		{ visibleOptionCount, defaultValue, options },
		createDefaultState,
	);

	const [lastOptions, setLastOptions] = useState(options);

	if (options !== lastOptions && !isDeepStrictEqual(options, lastOptions)) {
		dispatch({
			type: "reset",
			state: createDefaultState({ visibleOptionCount, defaultValue, options }),
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

	const selectFocusedOption = useCallback(() => {
		dispatch({
			type: "select-focused-option",
		});
	}, []);

	const insert = useCallback((text: string) => {
		dispatch({
			type: "insert",
			text,
		});
	}, []);

	const deleteCharacter = useCallback(() => {
		dispatch({
			type: "delete",
		});
	}, []);

	const visibleOptions = useMemo(() => {
		return options
			.filter((option) =>
				!state.filter
					? true
					: option.label.startsWith(state.filter) ||
						option.value.startsWith(state.filter),
			)
			.map((option, index) => ({
				...option,
				index,
			}))
			.slice(state.visibleFromIndex, state.visibleToIndex);
	}, [options, state.visibleFromIndex, state.visibleToIndex, state.filter]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: this is library code
	useEffect(() => {
		if (state.value && state.previousValue !== state.value) {
			onChange?.(state.value);
		}
	}, [state.previousValue, state.value, options, onChange]);

	return {
		focusedValue: state.focusedValue,
		visibleFromIndex: state.visibleFromIndex,
		visibleToIndex: state.visibleToIndex,
		filter: state.filter,
		value: state.value,
		visibleOptions,
		insert,
		focusNextOption,
		focusPreviousOption,
		selectFocusedOption,
		delete: deleteCharacter,
	};
};
