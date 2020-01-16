"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@oclif/command");
const utils = tslib_1.__importStar(require("../../lib/utils"));
const prompts = tslib_1.__importStar(require("../../lib/prompts"));
const requests = tslib_1.__importStar(require("../../lib/requests"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
class QuotesBest extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, QuotesBest.description, chainId);
        const request = await requests.getRequest(wallet, metadata, 'Quote');
        this.log();
        prompts.printObject(this, metadata, `Request: ${request.method}`, request.params);
        requests.multiPeerCall(wallet, request.method, request.params, (quote, locator, errors) => {
            this.log();
            if (!quote) {
                this.log(chalk_1.default.yellow('\nNo valid results found.\n'));
            }
            else {
                prompts.printOrder(this, request.side, request.signerToken, request.senderToken, locator, quote);
                this.log();
            }
        });
    }
}
exports.default = QuotesBest;
QuotesBest.description = 'get the best available quote';
