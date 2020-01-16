"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_ux_1 = require("cli-ux");
const chalk_1 = require("chalk");
const ethers_1 = require("ethers");
const emoji = require("node-emoji");
const bignumber_js_1 = require("bignumber.js");
const table_1 = require("table");
async function promptSide() {
    let side = (await cli_ux_1.cli.prompt('buy or sell')).toUpperCase();
    if (side.indexOf('B') === 0) {
        side = 'B';
    }
    if (side.indexOf('S') === 0) {
        side = 'S';
    }
    if (side !== 'B' && side !== 'S') {
        process.exit(0);
    }
    return side;
}
exports.promptSide = promptSide;
async function promptToken(metadata, signerTokenLabel) {
    const value = await cli_ux_1.cli.prompt(signerTokenLabel || 'signerToken');
    try {
        ethers_1.ethers.utils.getAddress(value);
        if (!(value in metadata.byAddress)) {
            throw new Error(`Token ${value} not found in metadata`);
        }
        return metadata.byAddress[value];
    }
    catch (e) {
        if (!(value.toUpperCase() in metadata.bySymbol)) {
            throw new Error(`Token ${value} not found in metadata`);
        }
        return metadata.bySymbol[value.toUpperCase()];
    }
}
exports.promptToken = promptToken;
async function promptTokens(metadata, firstLabel, secondLabel) {
    return {
        first: await promptToken(metadata, firstLabel),
        second: await promptToken(metadata, secondLabel),
    };
}
exports.promptTokens = promptTokens;
async function printOrder(ctx, side, signerToken, senderToken, locator, order) {
    const signerAmountDecimal = new bignumber_js_1.default(order.signer.amount)
        .dividedBy(new bignumber_js_1.default(10).pow(signerToken.decimals))
        .toFixed();
    const senderAmountDecimal = new bignumber_js_1.default(order.sender.amount)
        .dividedBy(new bignumber_js_1.default(10).pow(senderToken.decimals))
        .toFixed();
    ctx.log(chalk_1.default.underline.bold(`Response: ${locator}`));
    ctx.log();
    if (side === 'B') {
        ctx.log(emoji.get('sparkles'), chalk_1.default.bold('Buy'), chalk_1.default.bold(signerAmountDecimal), signerToken.name, 'for', chalk_1.default.bold(senderAmountDecimal), senderToken.name);
        ctx.log(chalk_1.default.gray(`Price ${chalk_1.default.white(new bignumber_js_1.default(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed())} ${signerToken.name}/${senderToken.name} (${chalk_1.default.white(new bignumber_js_1.default(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed())} ${senderToken.name}/${signerToken.name})`));
    }
    else {
        ctx.log(emoji.get('sparkles'), chalk_1.default.bold('Sell'), chalk_1.default.bold(senderAmountDecimal), senderToken.name, 'for', chalk_1.default.bold(signerAmountDecimal), signerToken.name);
        ctx.log(chalk_1.default.gray(`Price ${chalk_1.default.white(new bignumber_js_1.default(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed())} ${senderToken.name}/${signerToken.name} (${chalk_1.default.white(new bignumber_js_1.default(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed())} ${signerToken.name}/${senderToken.name})`));
    }
}
exports.printOrder = printOrder;
function getData(metadata, params) {
    const data = [[chalk_1.default.bold('Param'), chalk_1.default.bold('Value')]];
    for (let key in params) {
        try {
            ethers_1.ethers.utils.getAddress(params[key]);
            data.push([key, `${params[key]} (${metadata.byAddress[params[key]].name})`]);
        }
        catch (e) {
            data.push([key, params[key]]);
        }
    }
    return data;
}
exports.getData = getData;
async function printObject(ctx, metadata, title, params) {
    const data = getData(metadata, params);
    const config = {
        columns: {
            0: {
                alignment: 'left',
                width: 15,
            },
            1: {
                alignment: 'left',
                width: 60,
            },
        },
    };
    printTable(ctx, title, data, config);
}
exports.printObject = printObject;
function printTable(ctx, title, data, config) {
    ctx.log(chalk_1.default.underline.bold(title));
    ctx.log();
    ctx.log(table_1.table(data, config));
}
exports.printTable = printTable;
async function confirmTransaction(ctx, metadata, name, params) {
    const data = getData(metadata, params);
    const config = {
        columns: {
            0: {
                alignment: 'left',
                width: 15,
            },
            1: {
                alignment: 'left',
                width: 60,
            },
        },
    };
    printTable(ctx, `Transaction: ${name}`, data, config);
    if (await cli_ux_1.cli.confirm('Type "yes" to send')) {
        return true;
    }
    return false;
}
exports.confirmTransaction = confirmTransaction;
