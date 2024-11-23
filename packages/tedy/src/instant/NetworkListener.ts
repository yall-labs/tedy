import isOnline from "is-online";

let online = false;

async function checkIsOnline() {
	const oldOnline = online;
	const newOnline = await isOnline();

	if (oldOnline !== newOnline) {
		online = newOnline;
		return online;
	}

	return undefined;
}

export default class NetworkListener {
	static async getIsOnline() {
		return isOnline();
	}

	static listen(f: (online: boolean) => void) {
		const interval = setInterval(async () => {
			const onlineHasChanged = await checkIsOnline();
			if (typeof onlineHasChanged === "boolean") {
				f(onlineHasChanged);
			}
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}
}
