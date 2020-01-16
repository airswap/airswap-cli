"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const command_1 = require("@oclif/command");
const ethers_1 = require("ethers");
const utils = tslib_1.__importStar(require("../lib/utils"));
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const console_table_1 = require("console.table");
const constants_json_1 = tslib_1.__importDefault(require("../lib/constants.json"));
const deltaBalances_json_1 = tslib_1.__importDefault(require("../lib/deltaBalances.json"));
const swapDeploys = require('@airswap/swap/deploys.json');
class Balances extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, Balances.description, chainId);
        const swapAddress = swapDeploys[chainId];
        const balancesContract = new ethers_1.ethers.Contract(constants_json_1.default.deltaBalances[chainId], deltaBalances_json_1.default, wallet);
        const balances = await balancesContract.walletBalances(wallet.address, Object.keys(metadata.byAddress));
        const allowances = await balancesContract.walletAllowances(wallet.address, swapAddress, Object.keys(metadata.byAddress));
        let i = 0;
        const result = [];
        for (let token in metadata.byAddress) {
            if (!balances[i].eq(0)) {
                const balanceDecimal = new bignumber_js_1.default(balances[i].toString())
                    .dividedBy(new bignumber_js_1.default(10).pow(metadata.byAddress[token].decimals))
                    .toFixed();
                result.push({
                    Token: metadata.byAddress[token].name,
                    Balance: balanceDecimal,
                    Approved: allowances[i].eq(0) ? 'No' : chalk_1.default.green('Yes'),
                });
            }
            i++;
        }
        if (result.length) {
            this.log(console_table_1.getTable(result));
            this.log(`Balances displayed for ${result.length} of ${i} known tokens.\n`);
        }
        else {
            this.log(`The current account holds no balances in any known tokens.\n`);
        }
    }
}
exports.default = Balances;
Balances.description = 'display token balances';
