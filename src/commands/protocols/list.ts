import { Registry } from "@airswap/libraries";
import { protocolNames } from "@airswap/utils";
import { Command } from "@oclif/command";
import chalk from "chalk";
import { getTable } from "console.table";
import { cancelled } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";

export default class ProtocolsList extends Command {
	public static description = "list activated protocols";
	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			utils.displayDescription(this, ProtocolsList.description, chainId);

			this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`));

			const registryContract = Registry.getContract(wallet, chainId);
			const protocols = await registryContract.getProtocolsForStaker(
				wallet.address,
			);

			const result = [];
			protocols.map((id) => {
				result.push({
					id,
					label: protocolNames[id],
				});
			});
			if (result.length) {
				this.log(getTable(result));
			} else {
				this.log(chalk.yellow("No activated protocols"));
				this.log(
					`Add protocols you support with ${chalk.bold("protocols:add")}\n`,
				);
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
