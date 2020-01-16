"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const chalk_1 = require("chalk");
const command_1 = require("@oclif/command");
const cli_ux_1 = require("cli-ux");
const utils = require("../../lib/utils");
const prompts = require("../../lib/prompts");
const requests = require("../../lib/requests");
const bignumber_js_1 = require("bignumber.js");
const order_utils_1 = require("@airswap/order-utils");
const Swap = require('@airswap/swap/build/contracts/Swap.json');
const swapDeploys = require('@airswap/swap/deploys.json');
class OrdersGet extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, OrdersGet.description, chainId);
        const request = await requests.getRequest(wallet, metadata, 'Order');
        const locator = await cli_ux_1.cli.prompt('locator', { default: 'http://localhost:3000' });
        this.log();
        prompts.printObject(this, metadata, `Request: ${request.method}`, request.params);
        requests.peerCall(locator, request.method, request.params, async (err, order) => {
            if (err) {
                if (err === 'timeout') {
                    this.log(chalk_1.default.yellow('The request timed out.\n'));
                }
                else {
                    this.log(err);
                    this.log();
                }
                process.exit(0);
            }
            else {
                prompts.printOrder(this, request.side, request.signerToken, request.senderToken, locator, order);
                this.log(`Expiry ${chalk_1.default.green(new Date(order.expiry * 1000).toLocaleTimeString())}\n`);
                const swapAddress = swapDeploys[chainId];
                if (!order_utils_1.orders.isValidOrder(order)) {
                    this.log(chalk_1.default.yellow('Order has invalid params or signature'));
                }
                else if (order.signer.token !== request.signerToken.addr || order.sender.token !== request.senderToken.addr) {
                    this.log(chalk_1.default.yellow('Order tokens do not match those requested'));
                }
                else if (order.signature.validator && order.signature.validator.toLowerCase() !== swapAddress.toLowerCase()) {
                    this.log(chalk_1.default.yellow('Order is intended for another swap contract'));
                }
                else {
                    if (await prompts.confirmTransaction(this, metadata, 'swap', {
                        signerWallet: `${order.signer.wallet}`,
                        signerToken: `${order.signer.token} (${request.signerToken.name})`,
                        signerAmount: `${order.signer.amount} (${new bignumber_js_1.default(order.signer.amount)
                            .dividedBy(new bignumber_js_1.default(10).pow(request.signerToken.decimals))
                            .toFixed()})`,
                        senderWallet: `${order.sender.wallet} (You)`,
                        senderToken: `${order.sender.token} (${request.senderToken.name})`,
                        senderAmount: `${order.sender.amount} (${new bignumber_js_1.default(order.sender.amount)
                            .dividedBy(new bignumber_js_1.default(10).pow(request.senderToken.decimals))
                            .toFixed()})`,
                    })) {
                        new ethers_1.ethers.Contract(swapAddress, Swap.abi, wallet)
                            .swap(order)
                            .then(utils.handleTransaction)
                            .catch(utils.handleError);
                    }
                }
            }
        });
    }
}
exports.default = OrdersGet;
OrdersGet.description = 'get an order from a peer';
