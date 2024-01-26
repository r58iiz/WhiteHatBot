import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/Interfaces";
import { ExtendedClient } from "src/Client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Check the bot ping")

		.setNSFW(false)
		.setDMPermission(true),

	category: "Misc",
	cooldown: 5,
	filename: "ping",

	run: async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
		try {
			const sent = await interaction.reply({ content: "Pinging...", fetchReply: true });
			interaction.editReply(`Websocket latency: ${interaction.client.ws.ping}ms\nRoundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
		} catch (err) {
			client.customLogger.error("[HANDLER] [CMD] [SLASH] [PING] Ping command had an error", err);
		}
		return;
	}
};