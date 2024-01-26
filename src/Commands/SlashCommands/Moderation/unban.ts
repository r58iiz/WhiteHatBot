import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/Interfaces";
import { ExtendedClient } from "src/Client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("Unban a user")
		.addUserOption(option =>
			option
				.setName("user")
				.setDescription("The user to unban")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("Default: No reason")
				.setRequired(false)
		)

		.setNSFW(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false)
	,

	category: "Moderation",
	cooldown: 5,
	filename: "unban",

	run: async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
		if (!interaction.inCachedGuild()) {
			return;
		}

		const target = interaction.options.getUser("user");
		const reason = (interaction.options.getString("reason") || "No reason given");

		if (!target) {
			return;
		}

		if (target.id == interaction.member.user.id) {
			interaction.reply("You can't unban yourself.");
			return;
		}

		try {
			const auditReason = `Unbanned by ${interaction.member.displayName} (${interaction.user.id}): ${reason}`;
			interaction.guild.members.unban(target, auditReason);

			interaction.reply({ content: `\`${target.displayName}\` was unbanned: **${reason}**`, ephemeral: false });
		} catch (err) {
			interaction.reply({ content: `Failed to ban \`${target.displayName}\``, ephemeral: false });
			client.customLogger.error(`[HANDLER] [CMD] [SLASH] [UNBAN] Failed to unban ${target.displayName} (${target.id})`, err);
		}

		return;
	}
};