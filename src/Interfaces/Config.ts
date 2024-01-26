interface BotConfig {
	token: string;
	prefix: string;
	clientId: string;
	guildId: string;
}

interface AdditionalOptions {
	config: BotConfig;
}

export { AdditionalOptions, BotConfig };