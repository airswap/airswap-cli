"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const command_1 = require("@oclif/command");
const utils = tslib_1.__importStar(require("../../lib/utils"));
const prompts = tslib_1.__importStar(require("../../lib/prompts"));
const requests = tslib_1.__importStar(require("../../lib/requests"));
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const Swap = require('@airswap/swap/build/contracts/Swap.json');
const swapDeploys = require('@airswap/swap/deploys.json');
class OrdersBest extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, OrdersBest.description, chainId);
        const request = await requests.getRequest(wallet, metadata, 'Order');
        this.log();
        prompts.printObject(this, metadata, `Request: ${request.method}`, request.params);
        requests.multiPeerCall(wallet, request.method, request.params, async (order, locator, errors) => {
            this.log();
            if (!order) {
                this.log(chalk_1.default.yellow('\nNo valid results found.\n'));
            }
            else {
                prompts.printOrder(this, request.side, request.signerToken, request.senderToken, locator, order);
                this.log(`Expiry ${chalk_1.default.green(new Date(order.expiry * 1000).toLocaleTimeString())}\n`);
                if (await prompts.confirmTransaction(this, metadata, 'swap', {
                    signerWallet: order.signer.wallet,
                    signerToken: order.signer.token,
                    signerAmount: `${order.signer.amount} (${new bignumber_js_1.default(order.signer.amount)
                        .dividedBy(new bignumber_js_1.default(10).pow(request.signerToken.decimals))
                        .toFixed()})`,
                    senderWallet: `${order.sender.wallet} (You)`,
                    senderToken: order.sender.token,
                    senderAmount: `${order.sender.amount} (${new bignumber_js_1.default(order.sender.amount)
                        .dividedBy(new bignumber_js_1.default(10).pow(request.senderToken.decimals))
                        .toFixed()})`,
                })) {
                    const swapAddress = swapDeploys[chainId];
                    new ethers_1.ethers.Contract(swapAddress, Swap.abi, wallet)
                        .swap(order)
                        .then(utils.handleTransaction)
                        .catch(utils.handleError);
                }
            }
        });
    }
}
exports.default = OrdersBest;
OrdersBest.description = 'get the best available order';