import { Event } from "src/Interfaces";
import { Events as DiscordEvents } from "discord.js";
import { ExtendedClient } from "src/Client";

export const event: Event = {
	name: DiscordEvents.ClientReady,
	run: async (client: ExtendedClient) => {
		client.customLogger.info(`[HANDLER] [EVENT] [READY] ${client.user?.tag} is online!`);
	}
};