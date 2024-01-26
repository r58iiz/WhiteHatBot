import { Event } from "src/Interfaces";
import { Events as DiscordEvents, Message } from "discord.js";
import { ExtendedClient } from "src/Client";

export const event: Event = {
	name: DiscordEvents.MessageCreate,
	run: async (client: ExtendedClient, message: Message) => {
		if (
			message.author.bot ||
			!message.guild ||
			!message.content.startsWith(client.config.prefix)
		) return;

		const args = message.content
			.slice(client.config.prefix.length)
			.trim()
			.split(/ +/g);

		const cmd = args.shift()?.toLowerCase();
		if (!cmd) return;

		const command = client.commands.textCommands.get(cmd);
		if (command) {
			// Todo: Add check for disabled commands/groups


			/* Permissions */


			/* Cooldown */
			const { textCommandCD } = client.cooldown;
			const now = Date.now();
			const timestamps = textCommandCD.get(command.data.name);
			const cooldownAmount = (command.cooldown ?? 5) * 1000;
			if (timestamps && message.member && timestamps.has(message.member?.id)) {
				const expirationTime = timestamps.get(message.member?.id)! + cooldownAmount;
				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1000);
					try {
						message.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.` })
							.then(m => setTimeout(() => m.delete(), expirationTime - now));
					} catch (e) {
						console.error(e);
					}
					return;
				}
			} else {
				if (timestamps && message.member) {
					timestamps.set(message.member.id, now);
					setTimeout(() => timestamps.delete(message.member!.id), cooldownAmount);
				}
			}
			/* Command */
			command.run(client, message, args);
		}

	}
};