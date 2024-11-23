import type { ComponentTheme } from "@inkjs/ui";
import type { BoxProps, TextProps } from "ink";

const theme = {
	styles: {
		container: (): BoxProps => ({
			flexDirection: "column",
		}),
		option: ({ isFocused }): BoxProps => ({
			gap: 1,
			paddingLeft: isFocused ? 0 : 2,
		}),
		selectedIndicator: (): TextProps => ({
			color: "green",
		}),
		focusIndicator: (): TextProps => ({
			color: "blue",
		}),
		label({ isFocused, isSelected }): TextProps {
			let color: string | undefined;

			if (isSelected) {
				color = "green";
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
