import { Text } from "ink";
import { Route, Routes } from "react-router-dom";

import { Add } from "./param/Add.js";
import { Exit } from "../components/Exit.js";
import { Edit, EditRoot } from "./param/Edit.js";
import { View, ViewRoot } from "./param/View.js";
import { Delete, DeleteRoot } from "./param/Delete.js";
import { UnknownArgument } from "../components/UnknownArgument.js";

export function Param() {
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
			<Text>tedy param root</Text>
			<Exit />
		</>
	);
}
