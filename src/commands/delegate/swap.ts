import { SwapERC20 } from "@airswap/libraries";
import {
	createOrderERC20,
	createOrderERC20Signature,
	orderERC20ToParams,
	toDecimalString,
} from "@airswap/utils";
import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { cancelled, confirm, get, getTokens } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";
const Delegate = require("@airswap/delegate/build/contracts/Delegate.sol/Delegate.json");
const delegateDeploys = require("@airswap/delegate/deploys.js");
const IERC20 = require("@airswap/utils/build/src/abis/ERC20.json");

export default class DelegateSwap extends Command {
	public static description = "swap with the delegate";

	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			utils.displayDescription(this, DelegateSwap.description, chainId);

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

			const { senderAmount }: any = await get({
				senderAmount: {
					description: "buy amount",
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

			const swapContract = SwapERC20.getAddress(chainId);

			const protocolFee = await SwapERC20.getContract(
				wallet.provider,
				chainId,
			).protocolFee();

			const unsignedOrder = createOrderERC20({
				nonce: String(Date.now()),
				expiry: String(Math.round(Date.now() / 1000) + 120),
				protocolFee: protocolFee.toString(),
				signerWallet: wallet.address,
				signerToken: signerToken.address,
				signerAmount: utils
					.getAtomicValue(signerAmount, signerToken.address, metadata)
					.toFixed(),
				senderWallet: delegateContract.address,
				senderToken: senderToken.address,
				senderAmount: utils
					.getAtomicValue(senderAmount, senderToken.address, metadata)
					.toFixed(),
			});

			const signature = await createOrderERC20Signature(
				unsignedOrder,
				wallet.privateKey,
				swapContract,
				chainId,
			);

			const order = {
				...unsignedOrder,
				...signature,
			};

			this.log();

			if (
				await confirm(
					this,
					metadata,
					"swap",
					{
						signerWallet: order.signerWallet,
						signerToken: order.signerToken,
						signerAmount: `${order.signerAmount} (${chalk.cyan(
							toDecimalString(
								order.signerAmount,
								metadata.byAddress[signerToken.address].decimals,
							),
						)})`,
						senderWallet: `${delegateContract.address} (${chalk.cyan("Delegate")})`,
						senderToken: order.senderToken,
						senderAmount: `${order.senderAmount} (${chalk.cyan(
							toDecimalString(
								order.senderAmount,
								metadata.byAddress[senderToken.address].decimals,
							),
						)})`,
					},
					chainId,
				)
			) {
				delegateContract
					.swap(senderWallet, ...orderERC20ToParams(order))
					.then(utils.handleTransaction)
					.catch(utils.handleError);
			}
		} catch (e) {
			cancelled(e);
		}
	}

	public async validateAmount(amount: number) {
		if (!Number.isInteger(amount) && amount <= 0) {
			throw new Error(`${amount} is invalid.`);
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
				throw new Error(`Address ${address}: Unauthorized wallet.`);
			}
		}
	}
}
