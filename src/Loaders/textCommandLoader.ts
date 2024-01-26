import { Collection } from "discord.js";
import { glob } from "glob";
import { ExtendedClient } from "src/Client";

async function textCommandLoader(client: ExtendedClient, sourceDirectoryPath: string) {
	const customLogger = client.customLogger;

	const textCommandCategoryFolders: string[] = await glob(`${sourceDirectoryPath}/Commands/TextCommands/*`);
	const textCommandCategories: string[] =
		textCommandCategoryFolders
			.map(
				textCommandFilePath => textCommandFilePath
					.split(/[\\/]/g)
					.pop()
			)
			.filter(category =>
				typeof category == "string"
			) as string[];

	for (const category of textCommandCategories) {
		client.aggregatedCommandInfo.textCommandHelp.set(category, new Collection());
		const textCommandGlob = await glob(`${sourceDirectoryPath}/Commands/TextCommands/${category}/*.{js,ts}`);

		/**
		 * Text command properties:
		 *
		 * name: string,
		 * category: string,
		 * description: string,
		 * cooldown: integer,
		 * permissions: { botPerms: [Array], userPerms: [Array] }
		 */

		for (const file of textCommandGlob) {
			try {
				// Import command
				const { command } = await import(`${sourceDirectoryPath}/../${file}`);
				// Command data
				client.commands.textCommands.set(command.data.name, command);
				// Cooldown
				client.cooldown.textCommandCD.set(command.data.name, new Collection());
				// Help
				client.aggregatedCommandInfo.textCommandHelp
					.get(command.data.category)
					?.set(
						command.data.name,
						{
							description: command.data.description,
							nsfw: command.data.nsfw
						}
					);
			} catch (e) {
				customLogger.error(`[LOADER] [CMD] [SLASH] Could not load ${file}`, e);
			}
		}
		return;
	}
}

export { textCommandLoader };