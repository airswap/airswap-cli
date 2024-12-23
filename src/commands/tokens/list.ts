import { Registry } from "@airswap/libraries";
import { Command } from "@oclif/command";
import chalk from "chalk";
import { getTable } from "console.table";
import { cancelled } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";

export default class TokensList extends Command {
	public static description = "list activated tokens";
	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			utils.displayDescription(this, TokensList.description, chainId);

			this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`));

			const registryContract = Registry.getContract(wallet, chainId);
			const activatedTokens = await registryContract.getTokensForStaker(
				wallet.address,
			);

			const result = [];
			activatedTokens.map((address) => {
				const token = metadata.byAddress[address.toLowerCase()];
				result.push({
					address: token ? token.address : address,
					symbol: token ? token.symbol : "?",
				});
			});
			if (result.length) {
				this.log(getTable(result));
			} else {
				this.log(chalk.yellow("No activated tokens"));
				this.log(`Add tokens you support with ${chalk.bold("tokens:add")}\n`);
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
