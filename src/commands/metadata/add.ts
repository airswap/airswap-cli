import * as path from "node:path";
import { chainLabels, chainNames, explorerUrls } from "@airswap/utils";
import { Command } from "@oclif/command";
import chalk from "chalk";
import * as fs from "fs-extra";
import { cancelled, get } from "../../lib/prompt";
import * as utils from "../../lib/utils";

export default class MetadataAdd extends Command {
	public static description = "add token to local metadata";
	public async run() {
		try {
			const provider = await utils.getProvider(this);
			const chainId = (await provider.getNetwork()).chainId;

			this.log();
			utils.displayDescription(this, MetadataAdd.description, chainId);

			const metadataPath = path.join(
				this.config.configDir,
				`metadata-${chainLabels[chainId]}.json`,
			);

			const token: any = await get({
				symbol: {
					description: "ticker",
					type: "String",
				},
				name: {
					description: "name",
					type: "String",
				},
				decimals: {
					description: "decimals",
					type: "Number",
				},
				address: {
					description: "address",
					type: "Address",
				},
			});

			token.symbol = token.symbol.toUpperCase();
			token.chainId = chainId;
			token.decimals = Number(token.decimals);
			token.address = token.address.toLowerCase();

			let metadata = {
				byAddress: {},
				bySymbol: {},
			};

			if (await fs.pathExists(metadataPath)) {
				metadata = require(metadataPath);
			}

			this.log(
				`\n${token.symbol} (${token.name}) · ${explorerUrls[chainId]}/address/${token.address} · ${token.decimals} decimals`,
			);

			if (
				metadata.byAddress[token.address] ||
				metadata.bySymbol[token.symbol]
			) {
				const chainName = chainNames[chainId || "4"].toUpperCase();
				const { confirm }: any = await get({
					confirm: {
						description: chalk.white(
							`\nToken already exists in metadata. Type "yes" to overwrite it (${chainName})`,
						),
					},
				});
				if (confirm === "yes") {
					metadata.byAddress[token.address] = token;
					metadata.bySymbol[token.symbol] = token;

					await fs.outputJson(metadataPath, metadata);
					this.log(chalk.green("Local metadata updated\n"));
				} else {
					this.log("\nCancelled.\n");
				}
			} else {
				metadata.byAddress[token.address] = token;
				metadata.bySymbol[token.symbol] = token;

				await fs.outputJson(metadataPath, metadata);
				this.log(chalk.green("\nLocal metadata updated\n"));
			}
		} catch (e) {
			cancelled(e);
		}
	}
}
