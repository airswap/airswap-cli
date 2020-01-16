"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cli_ux_1 = require("cli-ux");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const jayson = tslib_1.__importStar(require("jayson"));
const ethers_1 = require("ethers");
const url = tslib_1.__importStar(require("url"));
const order_utils_1 = require("@airswap/order-utils");
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const prompts = tslib_1.__importStar(require("./prompts"));
const constants = require('./constants.json');
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json');
const indexerDeploys = require('@airswap/indexer/deploys.json');
function indexerCall(wallet, signerToken, senderToken, callback) {
    const indexerAddress = indexerDeploys[wallet.provider.network.chainId];
    new ethers_1.ethers.Contract(indexerAddress, Indexer.abi, wallet)
        .getLocators(signerToken, senderToken, constants.protocols.HTTP_LATEST, constants.INDEX_HEAD, constants.MAX_LOCATORS)
        .then(callback);
}
exports.indexerCall = indexerCall;
function peerCall(locator, method, params, callback) {
    let client;
    const locatorUrl = url.parse(locator);
    if (locatorUrl.protocol === 'https:') {
        client = jayson.Client.https(locatorUrl);
    }
    else {
        client = jayson.Client.http(locatorUrl);
    }
    client.request(method, params, function (err, error, result) {
        if (err) {
            callback(`\n${chalk_1.default.yellow('Connection Error')}: ${locator} \n ${err}`);
        }
        else {
            if (error) {
                callback(`\n${chalk_1.default.yellow('Maker Error')}: ${error.message}\n`);
            }
            else {
                callback(null, result);
            }
        }
    });
}
exports.peerCall = peerCall;
function multiPeerCall(wallet, method, params, callback) {
    indexerCall(wallet, params.signerToken, params.senderToken, (result) => {
        const locators = result.locators;
        let requested = 0;
        let completed = 0;
        let results = [];
        let errors = [];
        cli_ux_1.cli.action.start(`Requesting from ${locators.length} peer${locators.length !== 1 ? 's' : ''}`);
        for (let i = 0; i < locators.length; i++) {
            try {
                locators[i] = ethers_1.ethers.utils.parseBytes32String(locators[i]);
            }
            catch (e) {
                locators[i] = false;
            }
            if (locators[i]) {
                requested++;
                peerCall(locators[i], method, params, (err, order) => {
                    if (err) {
                        errors.push({ locator: locators[i], message: err });
                    }
                    else {
                        if (method.indexOf('Order') !== -1) {
                            if (order_utils_1.orders.isValidOrder(order)) {
                                results.push({
                                    locator: locators[i],
                                    order,
                                });
                            }
                            else {
                                errors.push({ locator: locators[i], message: 'Got an invalid order or signature ' });
                            }
                        }
                        else {
                            results.push({
                                locator: locators[i],
                                order,
                            });
                        }
                    }
                    if (++completed === requested) {
                        cli_ux_1.cli.action.stop();
                        if (!results.length) {
                            callback(null, null, errors);
                        }
                        else {
                            let lowest = results[0];
                            for (var j = 1; j < results.length; j++) {
                                if (new bignumber_js_1.default(results[j].order.sender.amount).lt(lowest.order.sender.amount)) {
                                    lowest = results[j];
                                }
                            }
                            callback(lowest.order, lowest.locator, errors);
                        }
                    }
                });
            }
        }
    });
}
exports.multiPeerCall = multiPeerCall;
async function getRequest(wallet, metadata, kind) {
    const side = await prompts.promptSide();
    const amount = await cli_ux_1.cli.prompt('amount');
    if (isNaN(parseInt(amount))) {
        process.exit(0);
    }
    const { first, second } = await prompts.promptTokens(metadata, 'of', 'for');
    let signerToken;
    let senderToken;
    if (side === 'B') {
        signerToken = first;
        senderToken = second;
    }
    else {
        signerToken = second;
        senderToken = first;
    }
    let method = 'getSenderSide' + kind;
    let params = {
        signerToken: signerToken.addr,
        senderToken: senderToken.addr,
    };
    if (kind === 'Order') {
        Object.assign(params, {
            senderWallet: wallet.address,
        });
    }
    if (side === 'B') {
        const signerAmountAtomic = new bignumber_js_1.default(amount).multipliedBy(new bignumber_js_1.default(10).pow(first.decimals));
        Object.assign(params, {
            signerAmount: signerAmountAtomic.integerValue(bignumber_js_1.default.ROUND_FLOOR).toFixed(),
        });
    }
    else {
        const senderAmountAtomic = new bignumber_js_1.default(amount).multipliedBy(new bignumber_js_1.default(10).pow(first.decimals));
        method = 'getSignerSide' + kind;
        Object.assign(params, {
            senderAmount: senderAmountAtomic.integerValue(bignumber_js_1.default.ROUND_FLOOR).toFixed(),
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
exports.getRequest = getRequest;
