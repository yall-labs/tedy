import { InstantReact, type Config } from "@instantdb/react";
import { id, type RoomSchemaShape, type InstantGraph } from "@instantdb/core";

import Storage from "./Storage.js";
import NetworkListener from "./NetworkListener.js";
import schema from "./instant.schema.js";

function init_experimental<
	// biome-ignore lint: this is library code (@instantdb/react-native)
	Schema extends InstantGraph<any, any, any>,
	WithCardinalityInference extends boolean = true,
>(
	config: Config & {
		schema: Schema;
		cardinalityInference?: WithCardinalityInference;
	},
) {
	return new InstantInk<
		Schema,
		// biome-ignore lint: this is library code (@instantdb/react-native)
		Schema extends InstantGraph<any, any, infer RoomSchema>
			? RoomSchema
			: never,
		WithCardinalityInference
	>(config);
}

class InstantInk<
	// biome-ignore lint: this is library code (@instantdb/react-native)
	Schema extends InstantGraph<any, any, any> | {} = {},
	// biome-ignore lint: this is library code (@instantdb/react-native)
	RoomSchema extends RoomSchemaShape = {},
	WithCardinalityInference extends boolean = false,
> extends InstantReact<Schema, RoomSchema, WithCardinalityInference> {
	// @ts-ignore
	static Storage = Storage;
	// @ts-ignore
	static NetworkListener = NetworkListener;
}

const APP_ID =
	process?.env?.INSTANT_APP_ID || "170841c8-fd5f-4fc3-a3a9-7cd5f89cbbd1"; // only use .env for dev environments otherwise use prod!

export const db = init_experimental({ appId: APP_ID, schema });

export { id };
