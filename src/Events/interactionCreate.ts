import { Event } from "src/Interfaces";
import { Events as DiscordEvents, BaseInteraction } from "discord.js";
import { ExtendedClient } from "src/Client";

export const event: Event = {
	name: DiscordEvents.InteractionCreate,
	run: async (client: ExtendedClient, interaction: BaseInteraction) => {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.slashCommands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			// Todo: Add check for disabled commands/groups

			/* Permissions */
			// Permissions are handled by discord itself

			/* Cooldown */
			const { slashCommandCD } = client.cooldown;
			const now = Date.now();
			const timestamps = slashCommandCD.get(command.data.name);
			const cooldownAmount = (command.cooldown ?? 5) * 1000;
			if (timestamps && timestamps.has(interaction.user.id)) {
				try {
					const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
					if (now < expirationTime) {
						const expiredTimestamp = Math.round(expirationTime / 1000);
						interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });

						return;
					}
				} catch (err) {
					client.customLogger.error(
						`[EVENT] [INTERACTION] [CMD] error setting cooldown \`${interaction.commandName}@${interaction.user.id}\``, err
					);

					return;
				}
			} else {
				if (timestamps) {
					timestamps.set(interaction.user.id, now);
					setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
				}
			}

			/* Command execution */
			try {
				await command.run(client, interaction);
			} catch (err) {
				client.customLogger.error(
					`[EVENT] [INTERACTION] [CMD] error executing \`${interaction.commandName}\``, err
				);
			}
		}
	}
};

