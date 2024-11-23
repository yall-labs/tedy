import { exit, nextTick } from "node:process";
import { useEffect } from "react";

export function Exit({ code = 0 }: { code?: number }) {
	useEffect(() => {
		nextTick(() => {
			exit(code);
		});
	}, [code]);

	return null;
}
