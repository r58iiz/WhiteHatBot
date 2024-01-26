import { glob } from "glob";
import { ExtendedClient } from "src/Client";

async function eventLoader(client: ExtendedClient, sourceDirectoryPath: string) {
	const eventGlob = await glob(`${sourceDirectoryPath}/Events/*.{js,ts}`);
	for (const file of eventGlob) {
		try {
			const { event } = await import(`${sourceDirectoryPath}/../${file}`);
			client.events.set(event.name, event);
			client.on(event.name, event.run.bind(null, client));
		} catch (e) {
			client.customLogger.error(`[LOADER][EVENT] Could not load ${file}`, e);
		}
	}
	return;
}

export { eventLoader };