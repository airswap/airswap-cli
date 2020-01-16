"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const command_1 = require("@oclif/command");
const ethers_1 = require("ethers");
const utils = require("../../lib/utils");
const prompts = require("../../lib/prompts");
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json');
const constants = require('../../lib/constants.json');
const indexerDeploys = require('@airswap/indexer/deploys.json');
class IntentEnable extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, IntentEnable.description, chainId);
        const indexerAddress = indexerDeploys[chainId];
        const stakingTokenContract = new ethers_1.ethers.Contract(constants.stakingTokenAddresses[chainId], IERC20.abi, wallet);
        const allowance = await stakingTokenContract.allowance(wallet.address, indexerAddress);
        if (!allowance.eq(0)) {
            this.log(chalk_1.default.yellow('Staking already enabled'));
            this.log(`Set intent with ${chalk_1.default.bold('intent:set')}\n`);
        }
        else {
            if (await prompts.confirmTransaction(this, metadata, 'approve', {
                token: `${constants.stakingTokenAddresses[chainId]} (AST)`,
                spender: `${indexerAddress} (Indexer)`,
            })) {
                stakingTokenContract
                    .approve(indexerAddress, constants.APPROVAL_AMOUNT)
                    .then(utils.handleTransaction)
                    .catch(utils.handleError);
            }
        }
    }
}
exports.default = IntentEnable;
IntentEnable.description = 'enable staking on the indexer';
