"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cli_ux_1 = require("cli-ux");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const keytar = tslib_1.__importStar(require("keytar"));
const ethers_1 = require("ethers");
const emoji = tslib_1.__importStar(require("node-emoji"));
const fs = tslib_1.__importStar(require("fs-extra"));
const path = tslib_1.__importStar(require("path"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const bignumber_js_1 = tslib_1.__importDefault(require("bignumber.js"));
const constants = require('./constants.json');
function displayDescription(ctx, title, network) {
    let networkName = '';
    if (network) {
        const selectedNetwork = constants.chainNames[network || '4'];
        networkName = network === 1 ? chalk_1.default.green(selectedNetwork) : chalk_1.default.cyan(selectedNetwork);
    }
    ctx.log(`${chalk_1.default.white.bold(title)} ${networkName}\n`);
}
exports.displayDescription = displayDescription;
async function getWallet(ctx, requireBalance) {
    const account = await keytar.getPassword('airswap-maker-kit', 'private-key');
    if (!account) {
        ctx.log(chalk_1.default.yellow(`No account set. Set one with ${chalk_1.default.bold('account:set')}\n`));
    }
    else {
        const config = path.join(ctx.config.configDir, 'config.json');
        if (!(await fs.pathExists(config))) {
            await fs.outputJson(config, {
                network: '4',
            });
        }
        const { network } = await fs.readJson(config);
        const selectedNetwork = constants.chainNames[network || '4'];
        const signerPrivateKey = Buffer.from(account, 'hex');
        const provider = ethers_1.ethers.getDefaultProvider(selectedNetwork);
        const wallet = new ethers_1.ethers.Wallet(signerPrivateKey, provider);
        const publicAddress = wallet.address;
        const balance = await provider.getBalance(publicAddress);
        if (requireBalance && balance.eq(0)) {
            ctx.log(chalk_1.default.yellow(`Account (${publicAddress}) must hold (${selectedNetwork}) ETH to execute transactions.\n`));
        }
        else {
            let balanceLabel = new bignumber_js_1.default(balance.toString()).dividedBy(new bignumber_js_1.default(10).pow(18)).toFixed();
            ctx.log(chalk_1.default.gray(`Account ${wallet.address} (${balanceLabel} ETH)\n`));
            return wallet;
        }
    }
}
exports.getWallet = getWallet;
async function getMetadata(ctx, network) {
    const selectedNetwork = constants.chainNames[network];
    const metadataPath = path.join(ctx.config.configDir, `metadata-${selectedNetwork}.json`);
    if (!(await fs.pathExists(metadataPath))) {
        ctx.log(chalk_1.default.yellow('\nLocal metadata not found'));
        await updateMetadata(ctx);
    }
    return require(metadataPath);
}
exports.getMetadata = getMetadata;
async function updateMetadata(ctx) {
    const metadataRinkeby = path.join(ctx.config.configDir, 'metadata-rinkeby.json');
    const metadataMainnet = path.join(ctx.config.configDir, 'metadata-mainnet.json');
    ctx.log('Updating metadata from forkdelta...');
    return new Promise((resolve, reject) => {
        axios_1.default('https://forkdelta.app/config/main.json')
            .then(async ({ data }) => {
            data.tokens.push({
                addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                fullName: 'Wrapped Ether',
                decimals: 18,
                name: 'WETH',
            });
            const byAddress = {};
            const bySymbol = {};
            for (let i in data.tokens) {
                bySymbol[data.tokens[i].name] = data.tokens[i];
                byAddress[data.tokens[i].addr] = data.tokens[i];
            }
            await fs.outputJson(metadataMainnet, {
                bySymbol,
                byAddress,
            });
            ctx.log(`Mainnet saved to: ${metadataMainnet}`);
            await fs.outputJson(metadataRinkeby, {
                bySymbol: {
                    DAI: {
                        addr: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
                        name: 'DAI',
                        decimals: 18,
                    },
                    WETH: {
                        addr: '0xc778417e063141139fce010982780140aa0cd5ab',
                        name: 'WETH',
                        decimals: 18,
                    },
                    AST: {
                        addr: '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8',
                        name: 'AST',
                        decimals: 4,
                    },
                },
                byAddress: {
                    '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': {
                        addr: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
                        name: 'DAI',
                        decimals: 18,
                    },
                    '0xc778417e063141139fce010982780140aa0cd5ab': {
                        addr: '0xc778417e063141139fce010982780140aa0cd5ab',
                        name: 'WETH',
                        decimals: 18,
                    },
                    '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8': {
                        addr: '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8',
                        name: 'AST',
                        decimals: 4,
                    },
                },
            });
            ctx.log(`Rinkeby saved to: ${metadataRinkeby}`);
            cli_ux_1.cli.action.stop();
            ctx.log(chalk_1.default.green('Local metadata updated\n'));
            resolve();
        })
            .catch((error) => reject(error));
    });
}
exports.updateMetadata = updateMetadata;
function handleTransaction(tx) {
    console.log(chalk_1.default.underline(`https://${constants.etherscanDomains[tx.chainId]}/tx/${tx.hash}\n`));
    cli_ux_1.cli.action.start(`Mining transaction (${constants.chainNames[tx.chainId]})`);
    tx.wait(constants.DEFAULT_CONFIRMATIONS).then(() => {
        cli_ux_1.cli.action.stop();
        console.log(`${emoji.get('white_check_mark')} Transaction complete (${constants.DEFAULT_CONFIRMATIONS} confirmations)\n\n`);
    });
}
exports.handleTransaction = handleTransaction;
function handleError(error) {
    console.log(`\n${chalk_1.default.yellow('Error')}: ${error.reason || error.responseText || error}`);
    console.log('Please check your input values.\n');
}
exports.handleError = handleError;
