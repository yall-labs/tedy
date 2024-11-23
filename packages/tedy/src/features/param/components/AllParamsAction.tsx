import { Spinner } from "@inkjs/ui";
import { Select } from "@yall-labs/ink-select";
import { Text } from "ink";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { Exit } from "../../../components/Exit.js";
import { useLocalParams } from "../hooks/useLocalParams.js";
import { db } from "../../../instant/index.js";
import { FlagsContext } from "../../../state/FlagsContext.js";

export function AllParamsAction({ action }: { action: string }) {
	const navigate = useNavigate();
	const { user } = db.useAuth();
	const { team } = useContext(FlagsContext);
	const { isLoading, data } = db.useQuery(
		!user
			? {}
			: team
				? { teams: { params: {} } }
				: {
						params: { $: { where: { user: user?.id as string } } },
					},
	);

	const params = (team ? data?.teams?.[0]?.params : data?.params) || [];

	const cloudParamsMap =
		params?.map(({ name }) => {
			const value = `tedy.${name}`;
			return { label: value, value };
		}) || [];
	const { localParams, isLoadingParams } = useLocalParams();
	const localParamsMap = localParams.map((value) => ({ label: value, value }));

	if (!user ? isLoadingParams : isLoading || isLoadingParams) {
		return <Spinner label="Fetching params" />;
	}

	if (localParams.length < 1 && cloudParamsMap.length < 1) {
		return (
			<>
				<Text>
					Unable to find any params, create one with{" "}
					<Text color="yellow">tedy param add</Text>
				</Text>
				<Exit />
			</>
		);
	}

	return (
		<Select
			options={localParamsMap.concat(cloudParamsMap)}
			onChange={(name) => navigate(`${action}${name}`)}
		/>
	);
}
