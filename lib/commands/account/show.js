"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ethers_1 = require("ethers");
const command_1 = require("@oclif/command");
const keytar = tslib_1.__importStar(require("keytar"));
const utils_1 = require("../../lib/utils");
class AccountShow extends command_1.Command {
    async run() {
        const signerPrivateKey = await keytar.getPassword('airswap-maker-kit', 'private-key');
        utils_1.displayDescription(this, AccountShow.description);
        if (!signerPrivateKey) {
            this.log(chalk_1.default.yellow(`\nNo account set. Set one with ${chalk_1.default.bold('account:set')}\n`));
        }
        else {
            const wallet = new ethers_1.ethers.Wallet(String(signerPrivateKey));
            this.log(`Private Key: ${signerPrivateKey}`);
            this.log(`Address:     ${wallet.address}\n`);
        }
    }
}
exports.default = AccountShow;
AccountShow.description = 'show the current account';
