import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { cancelled, confirm, get, getTokens } from "../lib/prompt";
import * as utils from "../lib/utils";
import { getWallet } from "../lib/wallet";

const IERC20 = require("@airswap/utils/build/src/abis/ERC20.json");

export default class Transfer extends Command {
	public static description = "transfer tokens to another account";
	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			const gasPrice = await utils.getGasPrice(this);
			utils.displayDescription(this, Transfer.description, chainId);

			const { token }: any = await getTokens({ token: "token" }, metadata);
			const { amount, recipient }: any = await get({
				amount: {
					description: "amount",
					type: "Number",
				},
				recipient: {
					description: "recipient",
					type: "Address",
				},
			});

			const atomicAmount = utils.getAtomicValue(
				amount,
				token.address,
				metadata,
			);
			const tokenContract = new ethers.Contract(
				token.address,
				IERC20.abi,
				wallet,
			);
			const tokenBalance = await tokenContract.balanceOf(wallet.address);

			if (tokenBalance.lt(atomicAmount.toString())) {
				cancelled("Insufficient balance.");
			} else {
				this.log();
				if (
					await confirm(
						this,
						metadata,
						"transfer",
						{
							to: recipient,
							value: `${atomicAmount} (${chalk.cyan(amount)})`,
						},
						chainId,
					)
				) {
					tokenContract
						.transfer(recipient, atomicAmount.toFixed(), { gasPrice })
						.then(utils.handleTransaction)
						.catch(utils.handleError);
				}
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
