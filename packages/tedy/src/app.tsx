import { Alert, Spinner } from "@inkjs/ui";
import { Box, Text } from "ink";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

import { db } from "./instant/index.js";
import { FlagsContext } from "./state/FlagsContext.js";
import { Login } from "./features/auth/Login.js";
import { Logout } from "./features/auth/Logout.js";
import { Command } from "./features/Command.js";
import { UnknownArgument } from "./components/UnknownArgument.js";
import { Exit } from "./components/Exit.js";
import { LocalProviders } from "./state/LocalProviders.js";
import { RunRoot, Run } from "./features/command/Run.js";
import { Param } from "./features/Param.js";
import { Move } from "./features/Move.js";
import { AuthenticatedRoute } from "./components/AuthenticatedRoute.js";

TimeAgo.addDefaultLocale(en);

type Props = {
	input: string[];
	flags: Record<string, unknown>;
};

export default function App({ input, flags }: Props) {
	const { isLoading, error, user } = db.useAuth();

	if (isLoading) {
		return flags.verbose ? (
			<Box>
				<Spinner label="initializing..." />
			</Box>
		) : (
			<></>
		);
	}

	if (error) {
		return (
			<>
				<Alert variant="error">{error.message}</Alert>
				<Exit code={1} />
			</>
		);
	}

	const route = `/${input.join("/")}`;
	return (
		<FlagsContext.Provider value={flags}>
			<LocalProviders userId={user?.id}>
				<MemoryRouter initialEntries={[route]}>
					<Routes>
						<Route path="/" index element={<Index />} />
						<Route path="login/*" element={<Login />} />
						<Route
							path="logout/*"
							element={
								<AuthenticatedRoute>
									<Logout />
								</AuthenticatedRoute>
							}
						/>
						<Route path="command/*" element={<Command />} />
						<Route path="param/*" element={<Param />} />
						<Route
							path="move/*"
							element={
								<AuthenticatedRoute>
									<Move />
								</AuthenticatedRoute>
							}
						/>
						<Route path="run">
							<Route index element={<RunRoot />} />
							<Route path=":name" element={<Run />} />
							<Route path="*" element={<UnknownArgument />} />
						</Route>
						<Route path="*" element={<UnknownArgument />} />
					</Routes>
				</MemoryRouter>
			</LocalProviders>
		</FlagsContext.Provider>
	);
}

function Index() {
	const { user } = db.useAuth();

	// todo: turn into root help
	return (
		<>
			{user && (
				<Text>
					Signed in as <Text color="green">{user?.email}</Text>
				</Text>
			)}
			<Exit />
		</>
	);
}
