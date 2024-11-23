import { db } from "../../../instant/index.js";

export function useIsAnon(): boolean {
	const { user } = db.useAuth();
	return !user;
}
