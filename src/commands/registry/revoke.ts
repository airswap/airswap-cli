import { Command } from "@oclif/command";
import chalk from "chalk";
import { ethers } from "ethers";
import { REVOKE_AMOUNT } from "../../lib/constants.json";
import { cancelled, confirm } from "../../lib/prompt";
import * as utils from "../../lib/utils";
import { getWallet } from "../../lib/wallet";

import { Registry } from "@airswap/libraries";

const IERC20 = require("@airswap/utils/build/src/abis/ERC20.json");

export default class RegistryRevoke extends Command {
	public static description = "disable staking on the registry";
	public async run() {
		try {
			const wallet = await getWallet(this, true);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			const gasPrice = await utils.getGasPrice(this);
			utils.displayDescription(this, RegistryRevoke.description, chainId);

			const registryContract = Registry.getContract(wallet, chainId);
			const stakingTokenContract = new ethers.Contract(
				await registryContract.stakingToken(),
				IERC20.abi,
				wallet,
			);
			const allowance = await stakingTokenContract.allowance(
				wallet.address,
				Registry.getAddress(chainId),
			);

			if (allowance.eq(0)) {
				this.log(chalk.yellow("Registry already revoked"));
			} else {
				const stakingToken =
					metadata.byAddress[stakingTokenContract.address.toLowerCase()];

				if (
					await confirm(
						this,
						metadata,
						"revoke",
						{
							token: `${stakingToken.address} ${stakingToken.symbol}`,
							spender: `${Registry.getAddress(chainId)} (Registry)`,
						},
						chainId,
					)
				) {
					stakingTokenContract
						.approve(Registry.getAddress(chainId), REVOKE_AMOUNT, {
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
