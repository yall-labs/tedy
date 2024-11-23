import { id } from "@instantdb/core";
import { Box, Text } from "ink";
import { useApp } from "ink";
import { spawn } from "node:child_process";
import { exit as exitTerm } from "node:process";
import { memo, useEffect, useState } from "react";

export const RunScript = memo(({ script }: { script: string }) => {
	const [items, setItems] = useState<Array<string>>([]);
	const { exit } = useApp();

	useEffect(() => {
		// TODO: detect pipes when adding commands
		// TODO: use stdout.pipe for cross platform support https://stackoverflow.com/a/52649324
		const run = spawn(script, {
			shell: true,
			stdio: [0, "pipe", "pipe"],
		});

		run.stdout?.setEncoding("utf-8");
		run.stdout?.on("data", (data) => {
			setItems((items) => [
				...items,
				data.endsWith("\n") ? data.substring(0, data.length - 1) : data,
			]);
		});

		run.stderr?.setEncoding("utf-8");
		run.stderr?.on("data", (data) => {
			setItems((items) => [
				...items,
				data.endsWith("\n") ? data.substring(0, data.length - 1) : data,
			]);
		});

		run.on("error", (error) => {
			exit(error);
		});

		run.on("close", (code) => {
			exit();
			exitTerm(code);
		});
	}, [script, exit]);

	return (
		<Box flexDirection="column" gap={0}>
			{items.map((item) => (
				<Text key={id()}>{item}</Text>
			))}
		</Box>
	);
});
