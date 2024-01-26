import path from "path";
import { Client, ClientOptions, Collection } from "discord.js";
import { TextCommand, SlashCommand, BotConfig, AdditionalOptions, Event } from "src/Interfaces";
import { eventLoader, slashCommandLoader, textCommandLoader } from "../Loaders";

class ExtendedClient extends Client {
	public aggregatedCommandInfo:
		{
			slashCommandHelp: Collection<string, Collection<string, { description: string, nsfw: boolean }>>,
			textCommandHelp: Collection<string, Collection<string, { description: string, nsfw: boolean }>>
		} = {
			slashCommandHelp: new Collection(),
			textCommandHelp: new Collection()
		};
	public commands:
		{
			slashCommands: Collection<string, SlashCommand>;
			textCommands: Collection<string, TextCommand>;
		} = {
			slashCommands: new Collection(),
			textCommands: new Collection()
		};
	public cooldown:
		{
			textCommandCD: Collection<string, Collection<string, number>>,
			slashCommandCD: Collection<string, Collection<string, number>>
		} = {
			textCommandCD: new Collection(),
			slashCommandCD: new Collection()
		};
	public events: Collection<string, Event> = new Collection();
	public config: BotConfig;

	// Custom logger for now
	// Get a proper logger
	public customLogger =
		{
			log: (text: string) => {
				const [d, t] = new Date().toISOString().split("T");
				console.info(`[${d} ${t.replace("Z", "")}] [LOG] ${text}`);
			},
			info: (text: string) => {
				const [d, t] = new Date().toISOString().split("T");
				console.info(`[${d} ${t.replace("Z", "")}] [INFO] ${text}`);
			},
			warn: (text: string) => {
				const [d, t] = new Date().toISOString().split("T");
				console.warn(`[${d} ${t.replace("Z", "")}] [WARN] ${text}`);
			},
			error: (text: string, err: unknown) => {
				const [d, t] = new Date().toISOString().split("T");
				console.error(`[${d} ${t.replace("Z", "")}] [ERR] ${text}`);
				console.error(err);
			}
		};

	constructor(options: ClientOptions, extendedOptions: AdditionalOptions) {
		super(options);
		/* Config Loading */
		if (!extendedOptions.config) {
			throw new Error("Invalid config!");
		} else {
			this.config = extendedOptions.config;
		}
	}

	public async init() {
		const sourceDirectoryPath: string = path.join(__dirname, "..");

		/* Command loading */
		await slashCommandLoader(this, sourceDirectoryPath);
		await textCommandLoader(this, sourceDirectoryPath);

		/* Event loading */
		await eventLoader(this, sourceDirectoryPath);

		/* Logging */
		this.customLogger.info(`[LOADER] [CMD] [TEXT] Loaded ${this.commands.textCommands.size} text commands`);
		this.customLogger.info(`[LOADER] [CMD] [SLASH] Loaded ${this.commands.slashCommands.size} slash commands`);
		this.customLogger.info(`[LOADER] [EVENT] Loaded ${this.events.size} events`);
	}
}

export { ExtendedClient };