"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const os = tslib_1.__importStar(require("os"));
const command_1 = require("@oclif/command");
const utils_1 = require("../lib/utils");
const constants_json_1 = require("../lib/constants.json");
class Local extends command_1.Command {
    async run() {
        const interfaces = os.networkInterfaces();
        utils_1.displayDescription(this, Local.description);
        let count = 0;
        for (const id in interfaces) {
            for (let i = 0; i < interfaces[id].length; i++) {
                if (interfaces[id][i].family === 'IPv4' && interfaces[id][i].address !== '127.0.0.1') {
                    count++;
                    this.log(`http://${interfaces[id][i].address}:${constants_json_1.DEFAULT_PORT}/`);
                }
            }
        }
        this.log(`\nFound ${count} local IPv4 addresses.\n`);
    }
}
exports.default = Local;
Local.description = 'display local network addresses';
