import { Alert } from "@inkjs/ui";
import { Text } from "ink";
import { useLocation } from "react-router-dom";

import { Exit } from "./Exit.js";

export function UnknownArgument() {
	const path = useLocation();

	return (
		<>
			<Alert variant="error">
				Unknown argument{" "}
				<Text bold>tedy{path.pathname.split("/").join(" ")}</Text>
			</Alert>
			<Exit code={1} />
		</>
	);
}
