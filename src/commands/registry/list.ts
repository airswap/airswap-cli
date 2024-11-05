import { Command } from "@oclif/command";
import chalk from "chalk";
import { getTable } from "console.table";
import { cancelled, get } from "../../lib/prompt";
import * as utils from "../../lib/utils";

import { Registry } from "@airswap/libraries";
import { ProtocolIds } from "@airswap/utils";

export default class RegistryList extends Command {
	public static description = "get urls from the registry";

	public async run() {
		try {
			const provider = await utils.getProvider(this);
			const chainId = (await provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			utils.displayDescription(this, RegistryList.description, chainId);

			this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`));

			const { pair }: any = await get({
				pair: {
					description: "Token pair (e.g. WETH/USDT)",
					type: "Pair",
				},
			});

			const [one, two] = pair.split("/");
			const first = metadata.bySymbol[one.toUpperCase()];
			const second = metadata.bySymbol[two.toUpperCase()];

			if (!first) {
				throw new Error(`${one.toUpperCase()} not found in metadata.`);
			}
			if (!second) {
				throw new Error(`${two.toUpperCase()} not found in metadata.`);
			}

			const urls = await Registry.getServerURLs(
				provider,
				chainId,
				ProtocolIds.RequestForQuoteERC20,
				first.address,
				second.address,
			);

			const rows = [];
			for (let i = 0; i < urls.length; i++) {
				rows.push({
					Server: urls[i],
				});
			}

			if (rows.length) {
				this.log();
				this.log(getTable(rows));
			} else {
				this.log(
					chalk.yellow(
						`\nNo servers currently support ${pair.toUpperCase()}.\n`,
					),
				);
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
