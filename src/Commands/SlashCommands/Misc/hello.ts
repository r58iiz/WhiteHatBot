import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/Interfaces";
import { ExtendedClient } from "src/Client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("hello")
		.setDescription("Returns a greeting")

		.addBooleanOption((option) =>
			option
				.setName("ephermal")
				.setDescription("Whether greeting is ephermal")
				.setRequired(false)
		)

		.setNSFW(false)
		.setDMPermission(true),

	category: "Misc",
	cooldown: 5,
	filename: "hello",

	run: async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
		try {
			const isGreetingEphermal = interaction.options.getBoolean("ephermal") || false;
			await interaction.reply({ content: "Hello", ephemeral: isGreetingEphermal });
		} catch (err) {
			client.customLogger.error("[HANDLER] [CMD] [SLASH] [HELLO] Hello command had an error", err);
		}
		return;
	}
};