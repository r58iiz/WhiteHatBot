import path from "path";
import { glob } from "glob";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/Interfaces";
import type { ExtendedClient } from "src/Client";
import { slashCommandLoader, textCommandLoader } from "./../../../Loaders";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("reload")
		.setDescription("Reloads a command.")

		.addSubcommand(subcommand =>
			subcommand
				.setName("all")
				.setDescription("Reloads all commands")
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("specific")
				.setDescription("Reload a specific command")
				.addStringOption(
					option =>
						option.setName("type")
							.setDescription("Type of command")
							.addChoices(
								{ name: "text", value: "textCommand" },
								{ name: "slash", value: "slashCommand" }
							)
							.setRequired(true)
				)
				.addStringOption(
					option =>
						option.setName("name")
							.setDescription("The command to reload.")
							.setRequired(true)
				)
		)

		.setNSFW(false)
		.setDMPermission(false),

	category: "Debug",
	cooldown: 1,
	filename: "reload",

	run: async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
		if (interaction.user.id !== "478727595719131146") return;

		const rootDirectoryPath: string = path.join(__dirname, "..", "..", "..");


		if (interaction.options.getSubcommand() == "all") {
			const allCommandsPathArray = await glob(path.join("Commands", "*", "*", "*.{js,ts}"), { root: rootDirectoryPath });
			console.log("allCommandsPathGlob:");
			for (const commandPath of allCommandsPathArray) {
				try {
					delete require.cache[require.resolve(commandPath)];
				} catch (err) {
					client.customLogger.error(
						`[HANDLER] [CMD] [SLASH] [RELOAD] Reload command all - failed to clear ${commandPath}`,
						err
					);
				}
			}
			await textCommandLoader(client, rootDirectoryPath);
			await slashCommandLoader(client, rootDirectoryPath);

		} else if (interaction.options.getSubcommand() == "specific") {
			const rootCommandDirectoryPath = path.join(rootDirectoryPath, "Commands");
			const commandName = interaction.options.getString("name", true);
			const commandType = interaction.options.getString("type", true);

			if (commandType == "slashCommand") {
				/* Slash command reloading */
				const slashCommandToReload = client.commands.slashCommands.get(commandName);
				if (!slashCommandToReload) {
					interaction.reply({ content: `There is no command with name \`${commandName}\``, ephemeral: true });
					return;
				}

				try {
					const slashCommandDirectoryPath: string = path.join(rootCommandDirectoryPath, "SlashCommands");
					const slashCommandPathArray = await glob(`/${slashCommandToReload.category}/${slashCommandToReload.filename}.{js,ts}`, { root: slashCommandDirectoryPath });
					if (slashCommandPathArray.length == 0) {
						client.customLogger.error(
							`[HANDLER] [CMD] [SLASH] [RELOAD] Reload command ${commandName} - slashCommandPathArray has length 0: ${slashCommandPathArray}`,
							slashCommandToReload
						);
						return;
					}
					const slashCommandPath = slashCommandPathArray[0];

					// Clear cache
					delete require.cache[require.resolve(slashCommandPath)];
					client.commands.slashCommands.delete(slashCommandToReload.data.name);

					const { command: newCommand } = await import(slashCommandPath);
					if (!newCommand) {
						throw new Error(`File ${slashCommandToReload.data.name} not found!`);
					}

					// Update for command handler
					client.commands.slashCommands.set(newCommand.data.name, newCommand);
					// Update for help
					client.aggregatedCommandInfo.slashCommandHelp
						.get(newCommand.category)
						?.set(
							newCommand.data.name,
							{
								description: newCommand.data.description,
								nsfw: newCommand.data.nsfw
							}
						);

					await interaction.reply({ content: `Command \`${newCommand.data.name}\` was reloaded!`, ephemeral: true });
				} catch (err) {
					client.customLogger.error(
						`[HANDLER] [CMD] [SLASH] [RELOAD] Reload command had an error while reloading \`${commandType}@${commandName}\``,
						err
					);
					await interaction.reply({ content: "An error occured! It has been logged.", ephemeral: true });
				}
			} else {
				/* Text command reloading */
				const textCommandToReload = client.commands.textCommands.get(commandName);
				if (!textCommandToReload) {
					interaction.reply({ content: `There is no command with name \`${commandName}\``, ephemeral: true });
					return;
				}

				try {
					const textCommandDirectoryPath: string = path.join(rootCommandDirectoryPath, "TextCommands");
					const textCommandPathGlob = await glob(`/${textCommandToReload.category}/${textCommandToReload.filename}.{js,ts}`, { root: textCommandDirectoryPath });
					if (textCommandPathGlob.length == 0) {
						client.customLogger.error(
							`[HANDLER] [CMD] [SLASH] [RELOAD] Reload command ${commandName} - textCommandPathGlob has length 0: ${textCommandPathGlob}`,
							textCommandPathGlob
						);
						return;
					}
					const textCommandPath = textCommandPathGlob[0];

					// Clear cache
					delete require.cache[require.resolve(textCommandPath)];
					client.commands.textCommands.delete(textCommandToReload.data.name);

					const { command: newCommand } = await import(textCommandPath);
					if (!newCommand) {
						throw new Error(`File ${textCommandToReload.data.name} not found!`);
					}

					// Update for command handler
					client.commands.textCommands.set(newCommand.data.name, newCommand);
					// Update for help
					client.aggregatedCommandInfo.textCommandHelp
						.get(newCommand.category)
						?.set(
							newCommand.data.name,
							{
								description: newCommand.data.description,
								nsfw: newCommand.data.nsfw
							}
						);

					await interaction.reply({ content: `Command \`${newCommand.data.name}\` was reloaded!`, ephemeral: true });
				} catch (err) {
					client.customLogger.error(
						`[HANDLER] [CMD] [SLASH] [RELOAD] Reload command had an error while reloading \`${commandType}@${commandName}\``,
						err
					);
					await interaction.reply({ content: "An error occured! It has been logged.", ephemeral: true });
				}
			}
		}
		return;
	}
};
