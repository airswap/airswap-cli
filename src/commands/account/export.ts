import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { displayDescription, getConfig } from "../../lib/utils";

export default class AccountExport extends Command {
	public static description = "export the current ethereum account";

	public async run() {
		displayDescription(this, AccountExport.description);
		const { key } = await getConfig(this);

		if (!key) {
			this.log(
				`\nNo account set. Set one with ${chalk.bold("account:import")}\n`,
			);
		} else {
			const wallet = new ethers.Wallet(String(key));
			this.log(`Private key: ${key}`);
			this.log(`Address:     ${wallet.address}\n`);
		}
	}
}
