import LocalStore from "./LocalStore.js";
import type { Command, PartialCommand } from "./Command.type.js";
import { appendSymbolToUsage } from "./LastUsed.type.js";

export default class LocalCommandStore extends LocalStore {
	commands: string[] = [];

	constructor() {
		super("anonymous", "commands");
	}

	async getAllCommands() {
		for await (const [key] of this.storage.db.iterator?.(this.namespace) ||
			[]) {
			this.commands.push(key);
		}

		return this.commands;
	}

	async hasCommand(name: string) {
		return this.storage.db.has(`${name}`);
	}

	async getCommand(name: string) {
		const rawCommand = await this.storage.getItem<PartialCommand>(name);
		return rawCommand === null
			? undefined
			: ({
					...rawCommand,
					usage: appendSymbolToUsage(rawCommand.usage),
					local: true,
					name,
				} satisfies Command);
	}

	async setCommand(name: string, value: PartialCommand) {
		return this.storage.setItem(name, value);
	}

	async deleteCommand(name: string) {
		return this.storage.deleteItem(name);
	}
}
