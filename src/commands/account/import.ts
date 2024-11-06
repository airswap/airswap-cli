import * as path from "path";
import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import * as emoji from "node-emoji";
import { get } from "../../lib/prompt";
import { displayDescription, updateConfig } from "../../lib/utils";

export default class AccountImport extends Command {
	public static description = "import an ethereum account";

	public async run() {
		displayDescription(this, AccountImport.description);

		this.log(
			`⚠️ Warning! This key will be stored in plaintext on your filesystem. (${path.join(this.config.configDir, "config.json")})\nYou may alternatively set the AIRSWAP_CLI_PRIVATE_KEY environment variable.\n`,
		);

		let key: string;
		try {
			const input: any = await get({
				key: {
					description: "Private key",
					type: "Private",
					hidden: true,
				},
			});
			key = input.key;
		} catch (e) {
			this.log("\n\nCancelled.\n");
			process.exit(0);
		}
		const wallet = new ethers.Wallet(key);
		await updateConfig(this, {
			key,
		});
		this.log(
			`\n${emoji.get("white_check_mark")} Set account to address ${chalk.bold(
				wallet.address,
			)}\n`,
		);
	}
}
