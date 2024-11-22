import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { cancelled, confirm } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";
const Delegate = require("@airswap/delegate/build/contracts/Delegate.sol/Delegate.json");
const delegateDeploys = require("@airswap/delegate/deploys.js");

export default class DelegateRevoke extends Command {
	public static description = "revoke a rule manager";

	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			utils.displayDescription(this, DelegateRevoke.description, chainId);

			const delegateContract = new ethers.Contract(
				delegateDeploys[chainId],
				Delegate.abi,
				wallet,
			);
			const currentManager = await delegateContract.authorized(wallet.address);
			if (!currentManager) {
				throw new Error("No manager currently authorized");
			}
			this.log(chalk.white(`Delegate contract: ${delegateContract.address}`));
			this.log(chalk.white(`Current manager: ${currentManager}\n`));

			if (await confirm(this, metadata, "revoke", {}, chainId)) {
				await delegateContract
					.revoke()
					.then(utils.handleTransaction)
					.catch(utils.handleError);
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
