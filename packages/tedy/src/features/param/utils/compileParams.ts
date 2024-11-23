import type {
	Context,
	ParamToken,
	RuntimeParam,
} from "../../../state/Param.type.js";

const baseTemplateRegex =
	/\{\{([a-zA-Z][a-zA-Z0-9]*?(?:\.[a-zA-Z][a-zA-Z0-9]*?)?\:\=[^\{\}]*?|[a-zA-Z][a-zA-Z0-9]*?(?:\.[a-zA-Z][a-zA-Z0-9]*?)?\=[a-zA-Z][a-zA-Z0-9]*?(?:\.[a-zA-Z][a-zA-Z0-9]*?)?|[a-zA-Z][a-zA-Z0-9]*?(?:\.[a-zA-Z][a-zA-Z0-9]*?)?)\}\}/g;

export type RuntimeContextParam = string | RuntimeParam | undefined;
export type RuntimeContextState = Record<string, RuntimeContextParam>;

// We need id's because these are blocks to be rendered in a map function,
// so React demands ids and we prefer them to be idempotent.
export type StringWithId = {
	id: string;
	value: string;
};

export const isParamToken = (x: StringWithId | RuntimeParam): x is ParamToken =>
	Object.keys(x).includes("context");

function getContext(context: string): Context {
	switch (context) {
		case "local":
			return "local";
		case "tedy":
			return "cloud";
		default:
			return "unknown";
	}
}

export function getFullTokenName(param: RuntimeParam): string {
	return `${param.context}#${param.name}`;
}

export function getRuntimeParam(param: string): RuntimeParam {
	const [context, name] = param.split("#") as [Context, string];
	return { context, name };
}

type ParseParams = {
	index: number;
	raw: string;
	assignee: string;
	assignor?: string;
	default?: string;
};

function parse(params: ParseParams): ParamToken {
	const parsedToken = parseToken(params.assignee);

	return {
		...parsedToken,
		id: `param-token-${params.index}`,
		raw: params.raw,
		assign: params.assignor ? parseToken(params.assignor) : undefined,
		default: params.default,
	} satisfies ParamToken;
}

function parseToken(token: string): RuntimeParam {
	if (token.includes(".")) {
		const [context, name] = token.split(".");
		return {
			name: name as string,
			context: getContext(context as string),
		};
	}

	return { name: token, context: "runtime" };
}

export function compileParams(
	input?: string,
): [Array<ParamToken>, RuntimeContextState] {
	if (!input) {
		return [[], {}];
	}

	const tokens: Array<ParamToken> = [];
	const matches = input.matchAll(baseTemplateRegex);
	const context: RuntimeContextState = {};

	let index = 0;
	for (const [raw, token] of matches) {
		let currentToken = {} as ParamToken;
		if (token?.includes(":=")) {
			const [_assignee, _default] = token.split(":=");
			currentToken = parse({
				index: index++,
				raw,
				assignee: _assignee as string,
				default: _default as string,
			});
		} else if (token?.includes("=")) {
			const [_assignee, _assignor] = token.split("=");
			currentToken = parse({
				index: index++,
				raw,
				assignee: _assignee as string,
				assignor: _assignor as string,
			});
		} else {
			currentToken = parse({
				index: index++,
				raw,
				assignee: token as string,
			});
		}

		tokens.push(currentToken);

		if (typeof context[getFullTokenName(currentToken)] === "undefined") {
			context[getFullTokenName(currentToken)] =
				currentToken.assign || currentToken.default || undefined;
		}
	}

	return [tokens, context];
}
