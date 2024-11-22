import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { cancelled, confirm, get } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";
const Delegate = require("@airswap/delegate/build/contracts/Delegate.sol/Delegate.json");
const delegateDeploys = require("@airswap/delegate/deploys.js");

export default class DelegateAuthorize extends Command {
	public static description = "authorize a rule manager";

	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			utils.displayDescription(this, DelegateAuthorize.description, chainId);

			const delegateContract = new ethers.Contract(
				delegateDeploys[chainId],
				Delegate.abi,
				wallet,
			);

			this.log(chalk.white(`Delegate contract: ${delegateContract.address}`));
			const currentManager = await delegateContract.authorized(wallet.address);
			this.log(
				chalk.white(
					`Current manager: ${currentManager === ethers.constants.AddressZero ? "None" : currentManager}\n`,
				),
			);

			const { manager }: any = await get({
				manager: {
					description: "Manager address to authorize",
					type: "Address",
				},
			});
			this.log();

			if (await confirm(this, metadata, "authorize", { manager }, chainId)) {
				await delegateContract
					.authorize(manager)
					.then(utils.handleTransaction)
					.catch(utils.handleError);
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
