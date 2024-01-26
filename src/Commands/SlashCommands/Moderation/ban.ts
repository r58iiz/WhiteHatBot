import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/Interfaces";
import { ExtendedClient } from "src/Client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Ban a member")

		.addUserOption(option =>
			option
				.setName("member")
				.setDescription("The member to ban")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("delete_messages")
				.setDescription("Default: Last 7 days")
				.setRequired(false)
				.addChoices(
					{ name: "Don't delete any", value: "0" },
					{ name: "Delete last 30 minutes", value: "30_min" },
					{ name: "Delete last hour", value: "1_hour" },
					{ name: "Delete last 3 hours", value: "3_hour" },
					{ name: "Delete last 6 hours", value: "6_hour" },
					{ name: "Delete last 12 hours", value: "12_hour" },
					{ name: "Delete last day", value: "1_day" },
					{ name: "Delete last 3 days", value: "3_day" },
					{ name: "Delete last 7 day", value: "7_day" },
				)
		)
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("Default: No reason")
				.setRequired(false)
		)
		.addBooleanOption(option =>
			option
				.setName("inform")
				.setDescription("Default: Yes")
				.setRequired(false)
		)

		.setNSFW(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false)
	,

	category: "Moderation",
	cooldown: 5,
	filename: "ban",

	run: async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
		if (!interaction.inCachedGuild()) {
			return;
		}

		const targetUser = interaction.options.getUser("member");
		const reason = (interaction.options.getString("reason") || "No reason given");
		const informViaDM = (interaction.options.getBoolean("inform") || true);
		const purgeDurationString = (interaction.options.getString("delete-messages") || "7_day");
		let purgeDuration = 0;

		if (!targetUser) {
			interaction.reply("Invalid target.");
			return;
		}

		if (purgeDurationString != "0") {
			const [time, unit] = purgeDurationString.split("_");
			switch (unit) {
				case "min":
					purgeDuration = Number(time) * 60;
					break;
				case "hour":
					purgeDuration = Number(time) * 60 * 60;
					break;
				case "day":
					purgeDuration = Number(time) * 60 * 60 * 24;
					break;
			}
		}

		if (targetUser.id == interaction.member.user.id) {
			interaction.reply("You can't ban yourself.");
			return;
		}

		const targetMember = interaction.options.getMember("member");
		if (targetMember) {
			const targetHighestRole = targetMember.roles.highest.position;
			const executorHighestRole = interaction.member.roles.highest.position;
			if (targetHighestRole > executorHighestRole || !targetMember.bannable) {
				interaction.reply("Target is of higher rank, can't be banned.");
				return;
			}
		}

		let notifiedWithDM: boolean = true;
		try {
			if (informViaDM && targetMember) {
				await targetUser.send(`You have been banned from ${interaction.guild.name} because of reason: \`${reason}\``);
			}
		} catch (err) {
			notifiedWithDM = false;
		}

		try {
			let auditReason = ((informViaDM && targetMember) ? (notifiedWithDM ? "[Notified via DM]" : "[DM failed]") : "[No DM]");
			auditReason += ` banned by ${interaction.member.displayName} (${interaction.user.id}): ${reason}`;

			interaction.guild.members.ban(targetUser.id, { reason: auditReason, deleteMessageSeconds: purgeDuration });
			interaction.reply({ content: `\`${targetUser.displayName}\` was banned: **${reason}**`, ephemeral: false });
		} catch (err) {
			interaction.reply({ content: `Failed to ban \`${targetUser.displayName}\``, ephemeral: false });
			client.customLogger.error(`[HANDLER] [CMD] [SLASH] [BAN] Failed to ban ${targetUser.displayName} (${targetUser.id})`, err);
		}
		return;
	}
};