import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

import { useIsAnon } from "../features/auth/hooks/useIsAnon.js";

export function AuthenticatedRoute({ children }: PropsWithChildren<unknown>) {
	const isAnon = useIsAnon();

	if (isAnon) {
		return <Navigate to="/login" replace={true} />;
	}

	return children;
}
