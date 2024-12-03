import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { cancelled, confirm, get, getTokens } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";
const Delegate = require("@airswap/delegate/build/contracts/Delegate.sol/Delegate.json");
const delegateDeploys = require("@airswap/delegate/deploys.js");
const IERC20 = require("@airswap/utils/build/src/abis/ERC20.json");

export default class DelegateSet extends Command {
	public static description = "set a delegate rule";

	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			utils.displayDescription(this, DelegateSet.description, chainId);

			const delegateContract = new ethers.Contract(
				delegateDeploys[chainId],
				Delegate.abi,
				wallet,
			);

			this.log(chalk.white(`Delegate contract: ${delegateContract.address}\n`));

			const { senderWallet }: any = await get({
				senderWallet: {
					description: "delegator wallet",
					type: "Address",
				},
			});
			await this.validateSenderWallet(senderWallet, wallet, delegateContract);

			const { senderAmount }: any = await get({
				senderAmount: {
					description: "sell amount",
					type: "Number",
				},
			});

			const { senderToken }: any = await getTokens(
				{ senderToken: "of token" },
				metadata,
			);

			const { signerAmount }: any = await get({
				signerAmount: {
					description: "for amount",
					type: "Number",
				},
			});

			const { signerToken }: any = await getTokens(
				{ signerToken: "of token" },
				metadata,
			);

			const { expiry }: any = await get({
				expiry: {
					description: "expiry (seconds)",
					type: "Number",
				},
			});
			this.log();

			const senderAmountAtomic = utils.getAtomicValue(
				senderAmount,
				senderToken.address,
				metadata,
			);
			const signerAmountAtomic = utils.getAtomicValue(
				signerAmount,
				signerToken.address,
				metadata,
			);
			const expiryTimestamp = Math.round(Date.now() / 1000) + Number(expiry);

			const tokenContract = new ethers.Contract(
				senderToken.address,
				IERC20.abi,
				wallet,
			);

			const allowance = await tokenContract.allowance(
				wallet.address,
				delegateContract.address,
			);

			if (allowance.lt(senderAmountAtomic.toFixed())) {
				this.log(
					chalk.yellow(
						`You must first approve the delegate contract to spend ${senderAmount} ${senderToken.symbol} (current allowance is ${utils.getDecimalValue(allowance.toString(), senderToken.address, metadata)})\n`,
					),
				);

				if (
					await confirm(
						this,
						metadata,
						"approve",
						{
							token: `${senderToken.address} (${senderToken.symbol})`,
							spender: `${delegateContract.address} (Delegate)`,
							amount: `${senderAmountAtomic.toFixed()} (${chalk.cyan(senderAmount)})`,
						},
						chainId,
					)
				) {
					const tx = await tokenContract.approve(
						delegateContract.address,
						senderAmountAtomic.toFixed(),
					);
					await utils.handleTransaction(tx);
					this.log(chalk.yellow("You can now set the rule."));
				} else {
					throw new Error("Cancelled");
				}
			}

			this.log();
			if (
				await confirm(
					this,
					metadata,
					"setRule",
					{
						senderWallet,
						senderToken: senderToken.address,
						senderAmount: `${senderAmountAtomic.toFixed()} (${chalk.cyan(senderAmount)})`,
						signerToken: signerToken.address,
						signerAmount: `${signerAmountAtomic.toFixed()} (${chalk.cyan(signerAmount)})`,
						expiry: `${expiryTimestamp} (${chalk.cyan(expiry)})`,
					},
					chainId,
				)
			) {
				await delegateContract
					.setRule(
						senderWallet,
						senderToken.address,
						senderAmountAtomic.toFixed(),
						signerToken.address,
						signerAmountAtomic.toFixed(),
						expiryTimestamp,
					)
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
