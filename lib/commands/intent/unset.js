"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const ethers_1 = require("ethers");
const command_1 = require("@oclif/command");
const utils = tslib_1.__importStar(require("../../lib/utils"));
const prompts = tslib_1.__importStar(require("../../lib/prompts"));
const constants_json_1 = tslib_1.__importDefault(require("../../lib/constants.json"));
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json');
const indexerDeploys = require('@airswap/indexer/deploys.json');
class IntentUnset extends command_1.Command {
    async run() {
        const wallet = await utils.getWallet(this);
        const chainId = (await wallet.provider.getNetwork()).chainId;
        const metadata = await utils.getMetadata(this, chainId);
        utils.displayDescription(this, IntentUnset.description, chainId);
        const indexerAddress = indexerDeploys[chainId];
        const indexerContract = new ethers_1.ethers.Contract(indexerAddress, Indexer.abi, wallet);
        this.log(chalk_1.default.white(`Indexer ${indexerAddress}\n`));
        const { first, second } = await prompts.promptTokens(metadata);
        this.log();
        const index = await indexerContract.indexes(first.addr, second.addr, constants_json_1.default.protocols.HTTP_LATEST);
        if (index === constants_json_1.default.ADDRESS_ZERO) {
            this.log(chalk_1.default.yellow(`Pair ${first.name}/${second.name} does not exist`));
            this.log(`Create this pair with ${chalk_1.default.bold('new:pair')}\n`);
        }
        else {
            if (await prompts.confirmTransaction(this, metadata, 'unsetIntent', {
                signerToken: `${first.addr} (${first.name})`,
                senderToken: `${second.addr} (${second.name})`,
                protocol: `${constants_json_1.default.protocols.HTTP_LATEST} (HTTPS)`,
            })) {
                new ethers_1.ethers.Contract(indexerAddress, Indexer.abi, wallet)
                    .unsetIntent(first.addr, second.addr, constants_json_1.default.protocols.HTTP_LATEST)
                    .then(utils.handleTransaction)
                    .catch(utils.handleError);
            }
        }
    }
}
exports.default = IntentUnset;
IntentUnset.description = 'unset an intent';
