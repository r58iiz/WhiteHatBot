import { ClientEvents } from "discord.js";
import { ExtendedClient } from "src/Client";

interface Run {
	// ...args: any[]
	// ...args: unknown[]
	// ...args: never[]
	(client: ExtendedClient, ...args: never[]): Promise<void> | void;
}

interface Event {
	name: keyof ClientEvents;
	run: Run;
}

export { Event };