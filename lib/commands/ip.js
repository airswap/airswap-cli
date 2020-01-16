"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const command_1 = require("@oclif/command");
const utils_1 = require("../lib/utils");
class IP extends command_1.Command {
    async run() {
        const interfaces = os.networkInterfaces();
        utils_1.displayDescription(this, IP.description);
        let count = 0;
        for (const id in interfaces) {
            for (let i = 0; i < interfaces[id].length; i++) {
                if (interfaces[id][i].family === 'IPv4' && interfaces[id][i].address !== '127.0.0.1') {
                    count++;
                    this.log(`${id}: ${interfaces[id][i].address}`);
                }
            }
        }
        this.log(`\nFound ${count} local IPv4 addresses.\n`);
    }
}
exports.default = IP;
IP.description = 'display local network addresses';
