import { Command } from "@oclif/command";
import chalk from "chalk";
import { cancelled, get } from "../lib/prompt";
import * as requests from "../lib/requests";
import * as utils from "../lib/utils";
import { getWallet } from "../lib/wallet";

export default class Order extends Command {
	public static description = "get an order from a server";
	public async run() {
		try {
			const wallet = await getWallet(this);
			const chainId = (await wallet.provider.getNetwork()).chainId;
			const metadata = await utils.getMetadata(this, chainId);
			const gasPrice = await utils.getGasPrice(this);
			utils.displayDescription(this, Order.description, chainId);

			const { locator }: any = await get({
				locator: {
					type: "Locator",
				},
			});
			const request = await requests.getRequest(wallet, metadata, "Order");
			this.log();

			requests.peerCall(
				locator,
				request.method,
				request.params,
				async (err, order) => {
					if (err) {
						if (err === "timeout") {
							this.log(chalk.yellow("The request timed out.\n"));
						} else {
							cancelled(err);
						}
						process.exit(0);
					} else {
						try {
							await requests.validateResponse(
								order,
								request.method,
								request.params,
								wallet,
							);
							utils.handleResponse(
								request,
								wallet,
								metadata,
								chainId,
								gasPrice,
								this,
								order,
							);
						} catch (e) {
							cancelled(e);
						}
					}
				},
			);
		} catch (e) {
			cancelled(e);
		}
	}
}
