import { Newline, Text } from "ink";
import { exit } from "node:process";
import { useEffect } from "react";

import { db } from "../../instant/index.js";

export function Logout() {
	const { user } = db.useAuth();

	useEffect(() => {
		if (user) {
			db.auth.signOut();
		} else {
			exit();
		}
	}, [user]);

	return (
		<Text>
			You are signed out.
			<Newline />
			Please use <Text color="yellow">tedy login</Text> to sign in again.
		</Text>
	);
}
