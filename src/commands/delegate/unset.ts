import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { cancelled, confirm, get, getTokens } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";
const Delegate = require("@airswap/delegate/build/contracts/Delegate.sol/Delegate.json");
const delegateDeploys = require("@airswap/delegate/deploys.js");

export default class DelegateUnsetRule extends Command {
	public static description = "unset a delegate rule";

	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			utils.displayDescription(this, DelegateUnsetRule.description, chainId);

			const delegateContract = new ethers.Contract(
				delegateDeploys[chainId],
				Delegate.abi,
				wallet,
			);

			this.log(chalk.white(`Delegate contract: ${delegateContract.address}\n`));

			const { senderWallet }: any = await get({
				senderWallet: {
					description: "from wallet",
					type: "Address",
				},
			});
			await this.validateSenderWallet(senderWallet, wallet, delegateContract);

			const { senderToken }: any = await getTokens(
				{ senderToken: "of token" },
				metadata,
			);

			const { signerToken }: any = await getTokens(
				{ signerToken: "for token" },
				metadata,
			);

			const rules = await delegateContract.rules(
				senderWallet,
				senderToken.address,
				signerToken.address,
			);

			if (rules[0] === ethers.constants.AddressZero) {
				throw new Error(
					"No rules found for the selected account and token pair.",
				);
			}

			this.log();
			if (
				await confirm(
					this,
					metadata,
					"unsetRule",
					{
						senderWallet,
						senderToken: senderToken.address,
						signerToken: signerToken.address,
					},
					chainId,
				)
			) {
				delegateContract
					.unsetRule(senderWallet, senderToken.address, signerToken.address)
					.then(utils.handleTransaction)
					.catch(utils.handleError);
			}
		} catch (e) {
			cancelled(e);
		}
	}

	public async validateSenderWallet(
		address: string,
		wallet: any,
		delegateContract: any,
	) {
		if (address !== wallet.address) {
			const { authorizedWallet } = await delegateContract.authorized(address);
			if (!authorizedWallet || authorizedWallet !== wallet.address) {
				throw new Error(
					`Current account is not a manager for ${address}. Use ${chalk.bold("delegate:authorize")} to authorize managers.`,
				);
			}
		}
	}
}
