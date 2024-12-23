import * as url from "url";
import { Registry, SwapERC20 } from "@airswap/libraries";
import { isValidOrderERC20, orderERC20ToParams } from "@airswap/utils";
import { ProtocolIds } from "@airswap/utils";
import { parseCheckResult } from "@airswap/utils";
import BigNumber from "bignumber.js";
import { cli } from "cli-ux";
import * as jayson from "jayson";
import { get, getTokens } from "./prompt";
import * as utils from "./utils";

const constants = require("./constants.json");

export function peerCall(
	locator: string,
	method: string,
	params: any,
	callback: any,
) {
	let client;

	if (/^ws:\/\//.test(locator) || /^wss:\/\//.test(locator)) {
		callback(`URL: Unable to call via HTTP`, null);
	} else {
		if (!/^http:\/\//.test(locator) && !/^https:\/\//.test(locator)) {
			locator = `https://${locator}`;
		}

		const locatorUrl = url.parse(locator);
		const options = {
			protocol: locatorUrl.protocol,
			hostname: locatorUrl.hostname,
			path: locatorUrl.path,
			port: locatorUrl.port,
			timeout: constants.REQUEST_TIMEOUT,
		};

		if (options.protocol === "http:") {
			client = jayson.Client.http(options);
		} else if (options.protocol === "https:") {
			client = jayson.Client.https(options);
		}

		client.request(method, params, (err: any, error: any, result: any) => {
			if (err) {
				callback(`Server: ${locator} \n ${err}`, null);
			} else if (error) {
				callback(`Server: ${error.message}`, null);
			} else if (result) {
				callback(null, result);
			} else {
				callback(null, null);
			}
		});
	}
}

export async function multiPeerCall(
	wallet: any,
	method: string,
	params: any,
	senderToken: string,
	signerToken: string,
	callback: any,
) {
	const chainId = (await wallet.provider.getNetwork()).chainId;
	const locators = await Registry.getServerURLs(
		wallet,
		chainId,
		ProtocolIds.RequestForQuoteERC20,
		senderToken,
		signerToken,
	);

	if (!locators.length) {
		callback();
		return;
	}

	let requested = 0;
	let completed = 0;
	const results: any[] = [];
	const errors: any[] = [];

	cli.action.start(
		`Requesting from ${locators.length} peer${locators.length !== 1 ? "s" : ""}`,
	);

	for (let i = 0; i < locators.length; i++) {
		if (locators[i]) {
			requested++;
			peerCall(locators[i], method, params, async (err: any, result: any) => {
				if (err) {
					errors.push({ locator: locators[i], message: err });
				} else {
					try {
						results.push(
							await validateResponse(result, method, params, wallet),
						);
					} catch (e) {
						errors.push({ locator: locators[i], message: e });
					}
				}

				if (++completed === requested) {
					cli.action.stop();

					if (!results.length) {
						callback(null, null, errors);
					} else {
						let best;
						if (method.indexOf("Signer") !== -1) {
							best = getHighestSwapSigner(results);
						} else {
							best = getLowestSwapSender(results);
						}
						callback(best, results, errors);
					}
				}
			});
		}
	}
}

export async function getRequest(wallet: any, metadata: any, kind: string) {
	const inputs: any = {
		side: {
			description: "buy or sell",
			type: "Side",
		},
		amount: {
			type: "Number",
		},
	};

	const { side, amount }: any = await get(inputs);
	const { first, second }: any = await getTokens(
		{ first: "of", second: "for" },
		metadata,
	);

	let signerToken;
	let senderToken;

	if (side === "buy") {
		signerToken = first;
		senderToken = second;
	} else {
		signerToken = second;
		senderToken = first;
	}

	const chainId = (await wallet.provider.getNetwork()).chainId;
	const swapContract = SwapERC20.getAddress(chainId);

	let method = "getSenderSide" + kind;
	const params = {
		signerToken: signerToken.address,
		senderToken: senderToken.address,
		swapContract,
		chainId: String(chainId),
	};

	if (kind === "OrderERC20") {
		Object.assign(params, {
			senderWallet: wallet.address,
		});
	}

	if (side === "buy") {
		const signerAmountAtomic = utils.getAtomicValue(
			amount,
			first.address,
			metadata,
		);
		Object.assign(params, {
			signerAmount: signerAmountAtomic
				.integerValue(BigNumber.ROUND_FLOOR)
				.toFixed(),
		});
	} else {
		const senderAmountAtomic = utils.getAtomicValue(
			amount,
			first.address,
			metadata,
		);
		method = "getSignerSide" + kind;
		Object.assign(params, {
			senderAmount: senderAmountAtomic
				.integerValue(BigNumber.ROUND_FLOOR)
				.toFixed(),
		});
	}

	return {
		side,
		signerToken,
		senderToken,
		method,
		params,
	};
}

function getHighestSwapSigner(results) {
	let best: any;
	let bestAmount = 0;
	let length = results.length;
	while (length-- > 0) {
		if (results[length].signerAmount > bestAmount) {
			best = results[length];
			bestAmount = best.signerAmount;
		}
	}
	return best;
}

function getLowestSwapSender(results) {
	let best: any;
	let bestAmount = Number.POSITIVE_INFINITY;
	let length = results.length;
	while (length-- > 0) {
		if (results[length].senderAmount < bestAmount) {
			best = results[length];
			bestAmount = best.senderAmount;
		}
	}
	return best;
}

export async function validateResponse(
	order: any,
	method: any,
	params: any,
	wallet: any,
) {
	const chainId = (await wallet.provider.getNetwork()).chainId;
	const errors = await SwapERC20.getContract(wallet, chainId).check(
		wallet.address,
		...orderERC20ToParams(order),
	);

	if (errors.length) {
		throw parseCheckResult(errors).join(", ");
	}

	if (isValidOrderERC20(order)) {
		if (method.indexOf("Sender") !== -1) {
			if (order.signerAmount === params.signerAmount) {
				return order;
			} else {
				throw "Signer amount does not match request";
			}
		} else {
			if (order.senderAmount === params.senderAmount) {
				return order;
			} else {
				throw "Sender amount does not match request";
			}
		}
	} else {
		throw "Received an invalid order";
	}
}
