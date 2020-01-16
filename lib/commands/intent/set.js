"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const ethers_1 = require("ethers");
const command_1 = require("@oclif/command");
const cli_ux_1 = require("cli-ux");
const utils = require("../../lib/utils");
const prompts = require("../../lib/prompts");
const constants = require('../../lib/constants.json');
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json');
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json');
const indexerDeploys = require('@airswap/indexer/deploys.json');
class IntentSet extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, IntentSet.description, chainId);
        const indexerAddress = indexerDeploys[chainId];
        const indexerContract = new ethers_1.ethers.Contract(indexerAddress, Indexer.abi, wallet);
        this.log(chalk_1.default.white(`Indexer ${indexerAddress}\n`));
        const { first, second } = await prompts.promptTokens(metadata);
        const locator = await cli_ux_1.cli.prompt('locator');
        const stakeAmount = await cli_ux_1.cli.prompt('stakeAmount');
        this.log();
        indexerContract.indexes(first.addr, second.addr, constants.protocols.HTTP_LATEST).then((index) => {
            if (index === constants.ADDRESS_ZERO) {
                this.log(chalk_1.default.yellow(`Pair ${first.name}/${second.name} does not exist`));
                this.log(`Create this pair with ${chalk_1.default.bold('new:pair')}\n`);
            }
            else {
                const atomicAmount = stakeAmount * 10 ** constants.AST_DECIMALS;
                new ethers_1.ethers.Contract(constants.stakingTokenAddresses[chainId], IERC20.abi, wallet)
                    .balanceOf(wallet.address)
                    .then((balance) => {
                    if (balance.toNumber() < atomicAmount) {
                        this.log(chalk_1.default.red('\n\nError ') +
                            `The selected account cannot stake ${stakeAmount} AST. Its balance is ${balance.toNumber() /
                                10 ** constants.AST_DECIMALS}.\n`);
                    }
                    else {
                        new ethers_1.ethers.Contract(constants.stakingTokenAddresses[chainId], IERC20.abi, wallet)
                            .allowance(wallet.address, indexerAddress)
                            .then(async (allowance) => {
                            if (allowance.lt(atomicAmount)) {
                                this.log(chalk_1.default.yellow('Staking is not enabled'));
                                this.log(`Enable staking with ${chalk_1.default.bold('intent:enable')}\n`);
                            }
                            else {
                                if (await prompts.confirmTransaction(this, metadata, 'setIntent', {
                                    signerToken: `${first.addr} (${first.name})`,
                                    senderToken: `${second.addr} (${second.name})`,
                                    protocol: `${constants.protocols.HTTP_LATEST} (HTTPS)`,
                                    locator,
                                    stakeAmount: atomicAmount,
                                })) {
                                    const locatorBytes = ethers_1.ethers.utils.formatBytes32String(locator);
                                    new ethers_1.ethers.Contract(indexerAddress, Indexer.abi, wallet)
                                        .setIntent(first.addr, second.addr, constants.protocols.HTTP_LATEST, atomicAmount, locatorBytes)
                                        .then(utils.handleTransaction)
                                        .catch(utils.handleError);
                                }
                            }
                        });
                    }
                });
            }
        });
    }
}
exports.default = IntentSet;
IntentSet.description = 'set an intent';
