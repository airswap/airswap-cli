"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const chalk_1 = require("chalk");
const command_1 = require("@oclif/command");
const cli_ux_1 = require("cli-ux");
const utils_1 = require("../lib/utils");
const constants = require('../lib/constants.json');
class Network extends command_1.Command {
    async run() {
        utils_1.displayDescription(this, Network.description);
        const config = path.join(this.config.configDir, 'config.json');
        const { network } = await fs.readJson(config);
        this.log(`Current network: ${network} (${constants.chainNames[network]})\n`);
        const newNetwork = await cli_ux_1.cli.prompt('network (e.g. 1=mainnet, 4=rinkeby)', { default: network });
        if (!(newNetwork in constants.chainNames)) {
            this.log(chalk_1.default.yellow(`\n${newNetwork} is not a supported chain.\n`));
        }
        else {
            await fs.outputJson(config, {
                network: newNetwork,
            });
            this.log(chalk_1.default.green(`\nSet active network to ${constants.chainNames[newNetwork]}.\n`));
        }
    }
}
exports.default = Network;
Network.description = 'set the active network';
