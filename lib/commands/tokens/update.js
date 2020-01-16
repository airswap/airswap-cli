"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@oclif/command");
const utils = tslib_1.__importStar(require("../../lib/utils"));
class TokensUpdate extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        utils.displayDescription(this, TokensUpdate.description, chainId);
        await utils.updateMetadata(this);
    }
}
exports.default = TokensUpdate;
TokensUpdate.description = 'update local metadata';
