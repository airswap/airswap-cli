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
class AccountUnset extends command_1.Command {
    async run() {
        const signerPrivateKey = await keytar.getPassword('airswap-maker-kit', 'private-key');
        utils_1.displayDescription(this, AccountUnset.description);
        if (signerPrivateKey) {
            const wallet = new ethers_1.ethers.Wallet(String(signerPrivateKey));
            this.log(`Private Key: ${signerPrivateKey}`);
            this.log(`Address:     ${wallet.address}\n`);
            if (await cli_ux_1.cli.confirm('Are you sure you want to delete this private key?')) {
                await keytar.deletePassword('airswap-maker-kit', 'private-key');
                this.log(`\n${emoji.get('white_check_mark')} The account has been unset.\n`);
            }
            else {
                this.log(chalk_1.default.yellow(`The account was not unset.\n`));
            }
        }
        else {
            this.log(`There is no current account stored.\n`);
        }
    }
}
exports.default = AccountUnset;
AccountUnset.description = 'unset the current account';
