import { Collection } from "discord.js";
import { glob } from "glob";
import { ExtendedClient } from "src/Client";

async function slashCommandLoader(client: ExtendedClient, sourceDirectoryPath: string) {
	const customLogger = client.customLogger;

	const slashCommandCategoryFolders: string[] = await glob(`${sourceDirectoryPath}/Commands/SlashCommands/*`);
	const slashCommandCategories: string[] =
		slashCommandCategoryFolders
			.map(
				slashCommandFilePath => slashCommandFilePath
					.split(/[\\/]/g)
					.pop()
			)
			.filter(category =>
				typeof category == "string"
			) as string[];

	for (const category of slashCommandCategories) {
		client.aggregatedCommandInfo.slashCommandHelp.set(category, new Collection());
		const slashCommandGlob = await glob(`${sourceDirectoryPath}/Commands/SlashCommands/${category}/*.{js,ts}`);

		/**
		 * Slash command properties:
		 *
		 * name: string,
		 * name_localizations: undefined,
		 * description: string,
		 * description_localizations: undefined,
		 * default_permission: undefined,
		 * default_member_permissions: undefined,
		 * dm_permission: undefined,
		 * nsfw: undefined
		 */

		for (const file of slashCommandGlob) {
			try {
				// Import command
				const { command } = await import(`${sourceDirectoryPath}/../${file}`);
				// Command data
				client.commands.slashCommands.set(command.data.name, command);
				// Cooldown
				client.cooldown.slashCommandCD.set(command.data.name, new Collection());
				// Help
				client.aggregatedCommandInfo.slashCommandHelp
					.get(category)
					?.set(
						command.data.name,
						{
							description: command.data.description,
							nsfw: command.data.nsfw
						}
					);
			} catch (e) {
				customLogger.error(`[LOADER] [CMD] [TEXT] Could not load ${file}`, e);
			}
		}
	}
	return;
}

export { slashCommandLoader };

