"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const hook = async function (options) {
    console.log(chalk_1.default.gray.bold(`AirSwap CLI ${options.config.version} — https://support.airswap.io/`));
};
exports.default = hook;
