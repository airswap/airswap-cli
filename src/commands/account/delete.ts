import { Command } from "@oclif/command";
import chalk from "chalk";
import { cli } from "cli-ux";
import { ethers } from "ethers";
import * as emoji from "node-emoji";
import { displayDescription } from "../../lib/utils";
import { requireKeytar } from "../../lib/wallet";

export default class AccountDelete extends Command {
	public static description = "delete the current ethereum account";

	public async run() {
		try {
			const keytar = requireKeytar();
			const signerPrivateKey = await keytar.getPassword(
				"airswap-cli",
				"private-key",
			);
			displayDescription(this, AccountDelete.description);

			if (signerPrivateKey) {
				const wallet = new ethers.Wallet(String(signerPrivateKey));

				this.log(`Private Key: ${signerPrivateKey}`);
				this.log(`Address:     ${wallet.address}\n`);

				if (
					await cli.confirm(
						"Are you sure you want to delete this private key? (yes/no)",
					)
				) {
					await keytar.deletePassword("airswap-cli", "private-key");
					this.log(
						`\n${emoji.get("white_check_mark")} The account has been deleted.\n`,
					);
				} else {
					this.log(chalk.yellow("\nThe account was not deleted.\n"));
				}
			} else {
				this.log("There is no ethereum account stored.\n");
			}
		} catch (e) {
			this.log(
				`${chalk.yellow("Error")} Cannot delete account because dependencies are missing.\nIf you are on Linux, try installing libsecret-1-0 (Debian, Ubuntu etc.) or libsecret (RedHat, Fedora etc.) and then reinstalling AirSwap CLI.\n`,
			);
		}
	}
}
