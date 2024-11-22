import * as path from "node:path";
import { chainLabels, explorerUrls } from "@airswap/utils";
import { Command } from "@oclif/command";
import chalk from "chalk";
import * as fs from "fs-extra";
import { cancelled, get } from "../../lib/prompt";
import * as utils from "../../lib/utils";

export default class MetadataLookup extends Command {
	public static description = "lookup token in local metadata";
	public async run() {
		try {
			const { chainId } = await utils.getConfig(this);

			this.log();
			utils.displayDescription(this, MetadataLookup.description, chainId);

			const metadataPath = path.join(
				this.config.configDir,
				`metadata-${chainLabels[chainId]}.json`,
			);

			const { needle }: any = await get({
				needle: {
					description: "ticker or address",
					type: "String",
				},
			});

			let metadata = {
				byAddress: {},
				bySymbol: {},
			};

			if (await fs.pathExists(metadataPath)) {
				metadata = require(metadataPath);
			}

			let token: {
				address: string;
				symbol: string;
				name: string;
				decimals: number;
			};

			if (needle.toUpperCase() in metadata.bySymbol) {
				token = metadata.bySymbol[needle.toUpperCase()];
			}
			if (needle in metadata.byAddress) {
				token = metadata.byAddress[needle];
			}

			this.log();
			if (!token) {
				this.log(chalk.yellow("Token not found in metadata"));
				this.log(`Add a new token with ${chalk.bold("metadata:add")}\n`);
			} else {
				this.log(
					`${token.symbol} (${token.name}) · ${explorerUrls[chainId]}/address/${token.address} · ${token.decimals} decimals\n`,
				);
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
