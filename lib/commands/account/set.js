"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ethers_1 = require("ethers");
const command_1 = require("@oclif/command");
const cli_ux_1 = require("cli-ux");
const utils_1 = require("../../lib/utils");
const keytar = tslib_1.__importStar(require("keytar"));
const emoji = tslib_1.__importStar(require("node-emoji"));
class AccountSet extends command_1.Command {
    async run() {
        utils_1.displayDescription(this, AccountSet.description);
        let signerPrivateKey = await cli_ux_1.cli.prompt('Private Key', { type: 'mask' });
        if (signerPrivateKey.indexOf('0x') === 0) {
            signerPrivateKey = signerPrivateKey.slice(2);
        }
        if (signerPrivateKey.length != 64) {
            this.log(chalk_1.default.yellow('\nPrivate key must be 64 characters long.\n'));
        }
        else {
            const wallet = new ethers_1.ethers.Wallet(signerPrivateKey);
            await keytar.setPassword('airswap-maker-kit', 'private-key', signerPrivateKey);
            this.log(`\n${emoji.get('white_check_mark')} Set account to ${chalk_1.default.bold(wallet.address)}\n`);
        }
    }
}
exports.default = AccountSet;
AccountSet.description = 'set the current account';
