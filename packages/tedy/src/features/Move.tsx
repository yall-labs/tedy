import { Route, Routes } from "react-router-dom";

import { Commands } from "./move/Commands.js";
import { Params } from "./move/Params.js";
import { UnknownArgument } from "../components/UnknownArgument.js";
import { AnonParamProvider } from "../state/AnonParamProvider.js";

export function Move() {
	return (
		<Routes>
			<Route index element={<Commands />} />
			<Route path="commands" element={<Commands />} />
			<Route
				path="params"
				element={
					<AnonParamProvider>
						<Params />
					</AnonParamProvider>
				}
			/>
			<Route path="*" element={<UnknownArgument />} />
		</Routes>
	);
}
