import * as path from "node:path";
import { chainLabels, explorerUrls } from "@airswap/utils";
import { Command } from "@oclif/command";
import chalk from "chalk";
import * as fs from "fs-extra";
import { cancelled, get } from "../../lib/prompt";
import * as utils from "../../lib/utils";

export default class MetadataDelete extends Command {
	public static description = "delete token from local metadata";
	public async run() {
		try {
			const provider = await utils.getProvider(this);
			const chainId = (await provider.getNetwork()).chainId;

			this.log();
			utils.displayDescription(this, MetadataDelete.description, chainId);

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
				this.log("Token not found in metadata.\n");
			} else {
				this.log(
					`${token.symbol} (${token.name}) · ${explorerUrls[chainId]}/address/${token.address} · ${token.decimals} decimals`,
				);

				const { confirm }: any = await get({
					confirm: {
						description: chalk.white(
							`\nType "yes" to remove this token (${token.symbol}) from local metadata`,
						),
					},
				});
				if (confirm === "yes") {
					delete metadata.byAddress[token.address];
					delete metadata.bySymbol[token.symbol];

					await fs.outputJson(metadataPath, metadata);
					this.log(chalk.green("Local metadata updated\n"));
				} else {
					this.log("\nCancelled.\n");
				}
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
