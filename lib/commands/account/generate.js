"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const command_1 = require("@oclif/command");
const utils_1 = require("../../lib/utils");
class AccountGenerate extends command_1.default {
    async run() {
        const newAccount = ethers_1.ethers.Wallet.createRandom();
        utils_1.displayDescription(this, AccountGenerate.description);
        this.log(`Private Key: ${newAccount.privateKey.slice(2)}`);
        this.log(`Address:     ${newAccount.address}\n`);
        this.log('Store this private key for safe keeping.\n');
    }
}
exports.default = AccountGenerate;
AccountGenerate.description = 'generate a new account';
