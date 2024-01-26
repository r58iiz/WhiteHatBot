import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "src/Interfaces";
import { ExtendedClient } from "src/Client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription("Kick a member")

		.addUserOption(option =>
			option
				.setName("member")
				.setDescription("The member to kick")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("Reason for kicking")
				.setRequired(false)
		)
		.addBooleanOption(option =>
			option
				.setName("inform")
				.setDescription("DM user about kick?")
				.setRequired(false)
		)

		.setNSFW(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setDMPermission(false)
	,

	category: "Moderation",
	cooldown: 5,
	filename: "kick",

	run: async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
		if (!interaction.inCachedGuild()) {
			return;
		}

		const target = interaction.options.getMember("member");
		const reason = (interaction.options.getString("reason") || "No reason given");
		const informViaDM = (interaction.options.getString("inform") || true);

		if (!target) {
			return;
		}

		if (target.user.id == interaction.user.id) {
			interaction.reply("You can't kick yourself.");
			return;
		}

		const targetHighestRole = target.roles.highest.position;
		const executorHighestRole = interaction.member.roles.highest.position;

		if (targetHighestRole > executorHighestRole || !target.kickable) {
			interaction.reply("Target is of higher rank, can't be kicked.");
			return;
		} else {
			let notifiedWithDM: boolean = true;
			try {
				if (informViaDM) {
					await target.send(`You have been kicked from ${interaction.guild.name} because of reason: \`${reason}\``);
				}
			} catch (err) {
				notifiedWithDM = false;
			}

			try {
				let auditReason = (informViaDM ? (notifiedWithDM ? "[Notified via DM]" : "[DM failed]") : "[No DM]");
				auditReason += ` kicked by ${interaction.member.displayName} (${interaction.user.id}): ${reason}`;

				target.kick(auditReason);
				interaction.reply({ content: `\`${target.displayName}\` was kicked: **${reason}**`, ephemeral: false });
			} catch (err) {
				interaction.reply({ content: `Failed to kick \`${target.displayName}\``, ephemeral: false });
				client.customLogger.error(`[HANDLER] [CMD] [SLASH] [KICK] Failed to kick ${target.displayName} (${target.user.id})`, err);

			}

		}
		return;
	}
};