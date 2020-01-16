"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const command_1 = require("@oclif/command");
const ethers_1 = require("ethers");
const utils = require("../../lib/utils");
const prompts = require("../../lib/prompts");
const constants = require('../../lib/constants.json');
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json');
const swapDeploys = require('@airswap/swap/deploys.json');
class TokensApprove extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this, true);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, TokensApprove.description, chainId);
        const swapAddress = swapDeploys[chainId];
        const token = await prompts.promptToken(metadata, 'token');
        this.log();
        const tokenContract = new ethers_1.ethers.Contract(token.addr, IERC20.abi, wallet);
        const allowance = await tokenContract.allowance(wallet.address, swapAddress);
        if (!allowance.eq(0)) {
            this.log(chalk_1.default.yellow(`${token.name} is already approved`));
            this.log(`Trading is enabled for this token.\n`);
        }
        else {
            if (await prompts.confirmTransaction(this, metadata, 'approve', {
                token: `${token.addr} (${token.name})`,
                spender: `${swapAddress} (Swap)`,
            })) {
                tokenContract
                    .approve(swapAddress, constants.APPROVAL_AMOUNT)
                    .then(utils.handleTransaction)
                    .catch(utils.handleError);
            }
        }
    }
}
exports.default = TokensApprove;
TokensApprove.description = 'approve a token for trading';
