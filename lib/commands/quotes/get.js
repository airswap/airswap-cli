"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@oclif/command");
const utils = tslib_1.__importStar(require("../../lib/utils"));
class QuotesGet extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        utils.displayDescription(this, QuotesGet.description, chainId);
    }
}
exports.default = QuotesGet;
QuotesGet.description = 'get a quote from a peer';
