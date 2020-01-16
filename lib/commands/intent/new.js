"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const command_1 = require("@oclif/command");
const ethers_1 = require("ethers");
const utils = require("../../lib/utils");
const prompts = require("../../lib/prompts");
const constants = require('../../lib/constants.json');
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json');
const indexerDeploys = require('@airswap/indexer/deploys.json');
class IntentNew extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, IntentNew.description, chainId);
        const indexerAddress = indexerDeploys[chainId];
        const indexerContract = new ethers_1.ethers.Contract(indexerAddress, Indexer.abi, wallet);
        this.log(chalk_1.default.white(`Indexer ${indexerAddress}\n`));
        const { first, second } = await prompts.promptTokens(metadata);
        this.log();
        indexerContract.indexes(first.addr, second.addr, constants.protocols.HTTP_LATEST).then(async (index) => {
            if (index !== constants.ADDRESS_ZERO) {
                this.log(`${chalk_1.default.yellow('Pair already exists')}`);
                this.log(`Set intent on this pair with ${chalk_1.default.bold('intent:set')}\n`);
            }
            else {
                if (await prompts.confirmTransaction(this, metadata, 'createIndex', {
                    signerToken: `${first.addr} (${first.name})`,
                    senderToken: `${second.addr} (${second.name})`,
                })) {
                    indexerContract
                        .createIndex(first.addr, second.addr, constants.protocols.HTTP_LATEST)
                        .then(utils.handleTransaction)
                        .catch(utils.handleError);
                }
            }
        });
    }
}
exports.default = IntentNew;
IntentNew.description = 'create an index for a new token pair';
