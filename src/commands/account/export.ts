import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { displayDescription } from "../../lib/utils";
import { requireKeytar } from "../../lib/wallet";

export default class AccountExport extends Command {
	public static description = "export the current ethereum account";

	public async run() {
		let keytar: any;
		try {
			keytar = requireKeytar();
			const signerPrivateKey = await keytar.getPassword(
				"airswap-cli",
				"private-key",
			);
			displayDescription(this, AccountExport.description);

			if (!signerPrivateKey) {
				this.log(
					chalk.yellow(
						`\nNo account set. Set one with ${chalk.bold("account:import")}\n`,
					),
				);
			} else {
				const wallet = new ethers.Wallet(String(signerPrivateKey));
				this.log(`Private key: ${signerPrivateKey}`);
				this.log(`Address:     ${wallet.address}\n`);
			}
		} catch (e) {
			this.log(
				`${chalk.yellow("Error")} Cannot export account because dependencies are missing.\nIf you are on Linux, try installing libsecret-1-0 (Debian, Ubuntu etc.) or libsecret (RedHat, Fedora etc.) and then reinstalling AirSwap CLI.\n`,
			);
		}
	}
}
