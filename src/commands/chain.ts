import { ChainIds, chainNames } from "@airswap/utils";
import { Command } from "@oclif/command";
import chalk from "chalk";
import { get } from "../lib/prompt";
import * as utils from "../lib/utils";

export default class Network extends Command {
	public static description = "set the active chain";
	public async run() {
		utils.displayDescription(this, Network.description);

		let chainId: string;
		try {
			chainId = await utils.getChainId(this);
			this.log(`Current chain: ${chainId} (${chainNames[chainId]})\n`);
		} catch (e) {
			this.log("Current chain not supported. Set a new one below.\n");
		}

		this.log("Available chains ids:\n");

		for (const chainId in ChainIds) {
			if (!Number.isNaN(Number(chainId)))
				this.log(`· ${chainId} (${chainNames[chainId]})`);
		}

		this.log();
		const { newChainId }: any = await get({
			newChainId: {
				description: "New chain id",
				default: chainId,
			},
		});

		if (!(newChainId in chainNames)) {
			this.log(chalk.yellow(`\n${newChainId} is not a supported chain.\n`));
		} else {
			await utils.updateConfig(this, {
				chainId: Number(newChainId),
			});

			this.log(
				chalk.green(`\nSet active chain to ${chainNames[newChainId]}.\n`),
			);
		}
	}
}
