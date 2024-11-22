import { toDecimalString } from "@airswap/utils";
import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { cancelled, confirm, get } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";

const wethDeploys = require("@airswap/wrapper/deploys-weth.js");
const WETH9 = require("@airswap/wrapper/build/contracts/WETH9.sol/WETH9.json");

export default class IntentUnset extends Command {
	public static description = "withdraw eth from weth";
	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			const gasPrice = await utils.getGasPrice(this);
			utils.displayDescription(this, IntentUnset.description, chainId);

			const WETH = metadata.byAddress[wethDeploys[chainId]];
			if (!WETH) {
				throw new Error("Wrapped token not found for the selected chain.");
			}

			const tokenContract = new ethers.Contract(
				WETH.address,
				WETH9.abi,
				wallet,
			);
			const tokenBalance = await tokenContract.balanceOf(wallet.address);
			const balanceDecimal = toDecimalString(
				tokenBalance.toString(),
				metadata.byAddress[WETH.address].decimals,
			);
			this.log(`WETH available to withdraw: ${chalk.bold(balanceDecimal)}\n`);

			const { amount }: any = await get({
				amount: {
					description: "amount to withdraw",
					type: "Number",
				},
			});
			const atomicAmount = utils.getAtomicValue(amount, WETH.address, metadata);

			if (atomicAmount.eq(0)) {
				cancelled("Amount must be greater than zero.");
			} else if (tokenBalance.lt(atomicAmount.toString())) {
				cancelled("Insufficient balance to withdraw.");
			} else {
				this.log();
				if (
					await confirm(
						this,
						metadata,
						"withdraw",
						{
							amount: `${atomicAmount} (${chalk.cyan(amount)})`,
						},
						chainId,
					)
				) {
					new ethers.Contract(WETH.address, WETH9.abi, wallet)
						.withdraw(ethers.BigNumber.from(atomicAmount.toFixed()), {
							gasPrice,
						})
						.then(utils.handleTransaction)
						.catch(utils.handleError);
				}
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
