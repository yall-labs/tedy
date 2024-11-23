import { EmailInput, TextInput } from "@inkjs/ui";
import { Newline, Text } from "ink";
import { useState } from "react";

import { db } from "../../instant/index.js";
import { Exit } from "../../components/Exit.js";

export function Login() {
	const { user } = db.useAuth();
	const [sentEmail, setSentEmail] = useState<string | undefined>(undefined);

	return !user ? (
		!sentEmail ? (
			<EmailInput
				placeholder="Enter your email to sign in"
				onSubmit={(email) => {
					setSentEmail(email);
					db.auth.sendMagicCode({ email }).catch((err) => {
						setSentEmail("");
					});
				}}
			/>
		) : (
			<TextInput
				placeholder="Enter the code we just emailed you"
				onSubmit={(code) => {
					db.auth
						.signInWithMagicCode({ email: sentEmail, code })
						.catch((err) => {
							setSentEmail("");
						});
				}}
			/>
		)
	) : (
		<>
			<Text>
				You now signed in as <Text color="green">{user.email}</Text>,
				<Newline />
				start by adding sequences to run by typing{" "}
				<Text color="yellow">tedy command add</Text>
				<Newline />
				If you added commands or params while not logged in, move them to your
				account using <Text color="yellow">tedy move</Text>
			</Text>
			<Exit />
		</>
	);
}
