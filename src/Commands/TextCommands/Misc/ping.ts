import { Message, PermissionsBitField } from "discord.js";
import { TextCommand } from "../../../Interfaces";
import { ExtendedClient } from "src/Client";

export const command: TextCommand = {
	data: {
		name: "ping",
		description: "Pong!",
		nsfw: false,
		permissions: {
			botPerms: [PermissionsBitField.Flags.SendMessages],
			userPerms: []
		}
	},

	cooldown: 5,
	category: "Misc",
	filename: "ping",

	run: async (client: ExtendedClient, message: Message) => {
		try {
			const sent = await message.channel.send("Pinging...");
			sent.edit(`Websocket latency: ${client.ws.ping}ms\nRoundtrip latency: ${sent.createdTimestamp - message.createdTimestamp}ms`);
		} catch (err) {
			client.customLogger.error("[HANDLER] [CMD] [TEXT] [PING] Ping command had an error", err);
		}
		return;
	}
};