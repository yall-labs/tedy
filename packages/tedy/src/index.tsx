#!/usr/bin/env node --no-warnings
import { render } from "ink";
import meow from "meow";
import App from "./app.js";

const cli = meow("", {
	autoHelp: false,
	importMeta: import.meta,
	flags: {
		compact: {
			type: "boolean",
			alias: "c",
			default: false,
		},
		verbose: {
			type: "boolean",
			alias: "v",
			default: false,
		},
		team: {
			type: "boolean",
			alias: "t",
			default: false,
		},
	},
});

render(<App input={cli.input} flags={cli.flags} />, { patchConsole: false });
