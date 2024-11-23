import type { ComponentTheme } from "@inkjs/ui";
import type { BoxProps, TextProps } from "ink";

const selectedStateMap = ["green", "yellow"];

const theme = {
	styles: {
		container: (): BoxProps => ({
			flexDirection: "column",
		}),
		option: ({ isFocused }): BoxProps => ({
			gap: 1,
			paddingLeft: isFocused ? 0 : 2,
		}),
		selectedIndicator: (selectedState = 0): TextProps => ({
			color: selectedStateMap[selectedState],
		}),
		focusIndicator: (): TextProps => ({
			color: "blue",
		}),
		label({ isFocused, selectedState }): TextProps {
			let color: string | undefined;

			if (typeof selectedState === "number") {
				color = selectedStateMap[selectedState];
			}

			if (isFocused) {
				color = "blue";
			}

			return { color };
		},
		highlightedText: (): TextProps => ({
			bold: true,
		}),
	},
} satisfies ComponentTheme;

export default theme;
export type Theme = typeof theme;
