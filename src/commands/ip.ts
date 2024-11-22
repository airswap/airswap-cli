import * as os from "node:os";
import { Command } from "@oclif/command";
import { DEFAULT_PORT } from "../lib/constants.json";
import { displayDescription } from "../lib/utils";

export default class Local extends Command {
	public static description = "display local network addresses";

	public async run() {
		const interfaces = os.networkInterfaces();

		displayDescription(this, Local.description);

		let count = 0;
		for (const id in interfaces) {
			for (let i = 0; i < interfaces[id].length; i++) {
				if (
					interfaces[id][i].family === "IPv4" &&
					interfaces[id][i].address !== "127.0.0.1"
				) {
					count++;
					this.log(`http://${interfaces[id][i].address}:${DEFAULT_PORT}/`);
				}
			}
		}

		this.log(`\nFound ${count} local IPv4 addresses.\n`);
	}
}
