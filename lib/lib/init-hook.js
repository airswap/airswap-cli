"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const hook = async function (options) {
    console.log(chalk_1.default.gray.bold(`\nAirSwap CLI ${options.config.version} — https://support.airswap.io/`));
};
exports.default = hook;
