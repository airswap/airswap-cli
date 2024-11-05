import readline from "node:readline";
import { Server, SwapERC20 } from "@airswap/libraries";
import {
	createOrderERC20,
	createOrderERC20Signature,
	getPriceForAmount,
	toAtomicString,
	toDecimalString,
} from "@airswap/utils";
import { ProtocolIds } from "@airswap/utils";
import { Command } from "@oclif/command";
import chalk from "chalk";
import * as jayson from "jayson";
import {
	cancelled,
	clearLines,
	confirm,
	get,
	getTokens,
	printQuote,
} from "../lib/prompt";
import * as utils from "../lib/utils";
import { getWallet } from "../lib/wallet";

const constants = require("../lib/constants.json");

export default class Stream extends Command {
	public static description = "stream quotes for a swap";
	public async run() {
		try {
			const wallet = await getWallet(this);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			utils.displayDescription(this, Stream.description, chainId);

			const { url, side, amount }: any = await get({
				url: {
					type: "Locator",
				},
				side: {
					description: "buy or sell",
					type: "Side",
				},
				amount: {
					type: "Number",
				},
			});
			const { first, second }: any = await getTokens(
				{ first: "of", second: "for" },
				metadata,
			);
			this.log("\n\n\n");

			const swapContract = SwapERC20.getAddress(chainId);
			let signerToken: { address: string; decimals: number };
			let senderToken: { address: string; decimals: number };
			let signerAmount: string;
			let senderAmount: string;
			let senderWallet: string;
			let senderServer: string;
			let taking = false;

			if (side === "buy") {
				senderToken = first;
				signerToken = second;
				senderAmount = amount;
			} else {
				signerToken = first;
				senderToken = second;
				signerAmount = amount;
			}

			const server = await Server.at(url);

			if (server.supportsProtocol(ProtocolIds.LastLookERC20)) {
				senderWallet = await server.getSenderWallet();
				await server.subscribeAllPricingERC20();
				server.on("pricing-erc20", (pricing) => {
					try {
						if (side === "buy") {
							signerAmount = getPriceForAmount(
								"buy",
								senderAmount,
								senderToken.address,
								signerToken.address,
								pricing,
							);
						} else {
							senderAmount = getPriceForAmount(
								"sell",
								signerAmount,
								signerToken.address,
								senderToken.address,
								pricing,
							);
						}
						if (signerAmount === null || senderAmount === null) {
							console.log("Pricing not available for selected pair.");
							process.exit(0);
						} else {
							if (!taking) {
								clearLines(3);
								printQuote(
									this,
									signerToken,
									signerAmount,
									senderToken,
									senderAmount,
								);
								console.log(chalk.gray("ENTER to proceed, CTRL+C to Cancel"));
							}
						}
					} catch (e) {
						console.log(`${chalk.yellow("Error")} ${e.message}\n`);
						process.exit(0);
					}
				});
			} else {
				console.log("Server does not support LastLookERC20.");
				process.exit(0);
			}

			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
				terminal: false,
			});

			rl.on("line", async () => {
				taking = true;
				rl.close();

				const protocolFee = await SwapERC20.getContract(
					wallet.provider,
					chainId,
				).protocolFee();

				const order = createOrderERC20({
					nonce: String(Date.now()),
					expiry: String(Math.round(Date.now() / 1000) + 120),
					protocolFee: protocolFee.toString(),
					signerWallet: wallet.address,
					signerToken: signerToken.address,
					signerAmount: toAtomicString(signerAmount, signerToken.decimals),
					senderWallet,
					senderToken: senderToken.address,
					senderAmount: toAtomicString(senderAmount, senderToken.decimals),
				});
				const signature = await createOrderERC20Signature(
					order,
					wallet.privateKey,
					swapContract,
					chainId,
				);

				order.protocolFee = undefined;
				order.senderWallet = undefined;

				if (
					await confirm(
						this,
						metadata,
						"swap",
						{
							signerWallet: `${order.signerWallet} (${chalk.cyan("You")})`,
							signerToken: order.signerToken,
							signerAmount: `${order.signerAmount} (${chalk.cyan(
								toDecimalString(
									order.signerAmount,
									metadata.byAddress[signerToken.address].decimals,
								),
							)})`,
							senderWallet,
							senderToken: order.senderToken,
							senderAmount: `${order.senderAmount} (${chalk.cyan(
								toDecimalString(
									order.senderAmount,
									metadata.byAddress[senderToken.address].decimals,
								),
							)})`,
						},
						chainId,
						"make this order",
						false,
					)
				) {
					if (senderServer) {
						console.log(`Sending order to ${chalk.bold(senderServer)}...`);
						const locatorUrl = url.parse(senderServer);
						const options = {
							protocol: locatorUrl.protocol,
							hostname: locatorUrl.hostname,
							path: locatorUrl.path,
							port: locatorUrl.port,
							timeout: constants.REQUEST_TIMEOUT,
						};

						let client: jayson.Client;
						if (options.protocol === "http:") {
							client = jayson.Client.http(options);
						} else if (options.protocol === "https:") {
							client = jayson.Client.https(options);
						}
						client.request(
							"considerOrderERC20",
							{
								...order,
								...signature,
							},
							(err: any, error: any, result: any) => {
								if (err || error) {
									console.log(chalk.yellow(err.message || error.message));
								} else {
									console.log(result, "\n");
								}
							},
						);
					} else {
						console.log("Sending order over the socket...");
						try {
							await server.considerOrderERC20({
								...order,
								...signature,
							});
						} catch (e) {
							cancelled(e.error ? e.error : e);
						}
						process.exit(0);
					}
				} else {
					cancelled("Cancelled");
					process.exit(0);
				}
			});
		} catch (e) {
			cancelled(e.message);
			process.exit(0);
		}
	}
}
