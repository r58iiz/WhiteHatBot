import { ExtendedClient } from "../Client/index";
import { Message, SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from "discord.js";

// am i supposed to use classes or interfaces?

interface TextCommandRun {
	(client: ExtendedClient, message: Message, args: string[]): void;
}

interface AdditionalPermissionCheck {
	(client: ExtendedClient, user: GuildMember, target: GuildMember): Promise<boolean>;
}

interface SlashCommandRun {
	(client: ExtendedClient, interaction: ChatInputCommandInteraction): void;
}

// interface SlashCommandData extends SlashCommandSubcommandsOnlyBuilder, Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> { }
interface SlashCommandData extends Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> { }

// To export
interface TextCommand {
	data: {
		name: string;
		description: string;
		nsfw: boolean;
		permissions: {
			botPerms: bigint[];
			userPerms: bigint[]; // PermissionsBitField.Flags[];
			additionalCheck?: AdditionalPermissionCheck;
		}
	};

	cooldown?: number;
	category: string;
	filename: string;
	run: TextCommandRun;
}

interface SlashCommand {
	data: SlashCommandData;
	filename: string;
	cooldown?: number;
	category: string;
	run: SlashCommandRun;
}

export { TextCommand, SlashCommand };