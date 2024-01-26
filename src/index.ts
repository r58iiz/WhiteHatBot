import { ExtendedClient } from "./Client";
import { GatewayIntentBits, Options } from "discord.js";
import dotenv from "dotenv";
import { AdditionalOptions } from "./Interfaces";
dotenv.config();

const clientOptions = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: 3600, // Sweep at an interval of 1h
			lifetime: 1800, // Remove messages older than 0.5h
		},

	}
};

const additionalOptions: AdditionalOptions = {
	config: {
		token: process.env.DISCORD_TOKEN || "",
		prefix: process.env.PREFIX || "+",
		guildId: process.env.GUILD_ID || "",
		clientId: process.env.CLIENT_ID || "",
	}
};

const whitehatBot = new ExtendedClient(clientOptions, additionalOptions);

(async () => {
	await whitehatBot.init();
	await whitehatBot.login();
})();