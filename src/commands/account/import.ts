import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import * as emoji from "node-emoji";
import { get } from "../../lib/prompt";
import { displayDescription } from "../../lib/utils";
import { requireKeytar } from "../../lib/wallet";

export default class AccountImport extends Command {
	public static description = "import an ethereum account";

	public async run() {
		displayDescription(this, AccountImport.description);
		let signerPrivateKey: string;
		let keytar: any;
		try {
			const input: any = await get({
				signerPrivateKey: {
					description: "Private key",
					type: "Private",
					hidden: true,
				},
			});
			signerPrivateKey = input.signerPrivateKey;
		} catch (e) {
			this.log("\n\nCancelled.\n");
			process.exit(0);
		}
		try {
			keytar = requireKeytar();
			const wallet = new ethers.Wallet(signerPrivateKey);
			await keytar.setPassword("airswap-cli", "private-key", signerPrivateKey);
			this.log(
				`\n${emoji.get("white_check_mark")} Set account to address ${chalk.bold(
					wallet.address,
				)}\n`,
			);
		} catch (e) {
			this.log(
				`${chalk.yellow("Error")} Cannot import account because dependencies are missing.\nIf you are on Linux, try installing libsecret-1-0 (Debian, Ubuntu etc.) or libsecret (RedHat, Fedora etc.) and then reinstalling AirSwap CLI.\n`,
			);
		}
	}
}
