import { Text } from "ink";
import { Route, Routes } from "react-router-dom";

import { Exit } from "../components/Exit.js";
import { UnknownArgument } from "../components/UnknownArgument.js";
import { Add } from "./command/Add.js";
import { Delete, DeleteRoot } from "./command/Delete.js";
import { Edit, EditRoot } from "./command/Edit.js";
import { Run, RunRoot } from "./command/Run.js";
import { View, ViewRoot } from "./command/View.js";

export function Command() {
	return (
		<Routes>
			<Route index element={<Index />} />
			<Route path="add" element={<Add />} />
			<Route path="delete">
				<Route index element={<DeleteRoot />} />
				<Route path=":name" element={<Delete />} />
				<Route path="*" element={<UnknownArgument />} />
			</Route>
			<Route path="edit">
				<Route index element={<EditRoot />} />
				<Route path=":name" element={<Edit />} />
				<Route path="*" element={<UnknownArgument />} />
			</Route>
			<Route path="run">
				<Route index element={<RunRoot />} />
				<Route path=":name" element={<Run />} />
				<Route path="*" element={<UnknownArgument />} />
			</Route>
			<Route path="view">
				<Route index element={<ViewRoot />} />
				<Route path=":name" element={<View />} />
				<Route path="*" element={<UnknownArgument />} />
			</Route>
			<Route path="*" element={<UnknownArgument />} />
		</Routes>
	);
}

function Index() {
	return (
		<>
			<Text>tedy command root</Text>
			<Exit />
		</>
	);
}
