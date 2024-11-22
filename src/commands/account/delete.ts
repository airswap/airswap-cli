import { Command } from "@oclif/command";
import chalk from "chalk";
import { cli } from "cli-ux";
import { ethers } from "ethers";
import * as emoji from "node-emoji";
import { displayDescription, getConfig, updateConfig } from "../../lib/utils";
import { requireKeytar } from "../../lib/wallet";

export default class AccountDelete extends Command {
	public static description = "delete the current ethereum account";

	public async run() {
		displayDescription(this, AccountDelete.description);
		const { key } = await getConfig(this);

		if (key) {
			const wallet = new ethers.Wallet(String(key));

			this.log(`Private Key: ${key}`);
			this.log(`Address:     ${wallet.address}\n`);

			if (
				await cli.confirm(
					"Are you sure you want to delete this private key? (yes/no)",
				)
			) {
				await updateConfig(this, {
					key: undefined,
				});
				this.log(
					`\n${emoji.get("white_check_mark")} The account has been deleted.\n`,
				);
			} else {
				this.log(chalk.yellow("\nThe account was not deleted.\n"));
			}
		} else {
			this.log("There is no ethereum account stored.\n");
		}
	}
}
