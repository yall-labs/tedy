import { Box } from "ink";
import type { PropsWithChildren } from "react";

export function BorderedBox({ children }: PropsWithChildren<unknown>) {
	return (
		<Box
			padding={1}
			borderColor="yellow"
			borderStyle="round"
			flexDirection="column"
			gap={1}
		>
			{children}
		</Box>
	);
}
