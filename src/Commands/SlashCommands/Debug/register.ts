import { ChatInputCommandInteraction, REST, Routes, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/Interfaces";
import { ExtendedClient } from "src/Client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("register")
		.setDescription("Re-registers all slash commands.")

		.setNSFW(false)
		.setDMPermission(false),

	category: "Debug",
	cooldown: 1,
	filename: "register",

	run: async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
		if (interaction.user.id !== "478727595719131146") return;
		await interaction.deferReply({ ephemeral: true });

		const rest = new REST().setToken(
			client.config.token
		);

		try {
			await rest.put(
				Routes.applicationGuildCommands(
					client.config.clientId,
					client.config.guildId
				),
				{ body: [] }
			);

			client.customLogger.info("[HANDLER] [CMD] [DEBUG] [REGISTER] Successfully deleted all application commands.");
			interaction.editReply({ content: "Successfully deleted all application commands." });
		} catch (err) {
			client.customLogger.error("[HANDLER] [CMD] [DEBUG] [REGISTER] Failed to delete all application commands", err);
		}

		try {
			const commandData = client.commands.slashCommands.map((command) => command.data.toJSON());
			await rest.put(
				Routes.applicationGuildCommands(
					client.config.clientId,
					client.config.guildId
				),
				{ body: commandData }
			);

			client.customLogger.info("[HANDLER] [CMD] [DEBUG] [REGISTER] Successfully registered all application commands.");
			const reply = await interaction.fetchReply();
			interaction.editReply({ content: `${reply.content}\nSuccessfully registered all application commands.`, });
		} catch (err) {
			client.customLogger.error("[HANDLER] [CMD] [DEBUG] [REGISTER] Failed to registered application commands", err);
		}

		return;
	}
};


