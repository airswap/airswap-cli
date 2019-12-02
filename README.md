# AirSwap Maker Kit

Maker Kit includes tools and examples to help you get started on the AirSwap Network.

[![Discord](https://img.shields.io/discord/590643190281928738.svg)](https://discord.gg/ecQbV7H)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![Twitter Follow](https://img.shields.io/twitter/follow/airswap?style=social)

- Docs → https://docs.airswap.io/
- Website → https://www.airswap.io/
- Blog → https://blog.airswap.io/
- Support → https://support.airswap.io/

## Introduction

AirSwap is a peer-to-peer trading network for Ethereum (ERC20, ERC721) tokens. Using an Indexer smart contract, peers can find each other based on their mutual intent to trade specific tokens. Once found, peers exchange pricing information and settle trades on a Swap contract.

This package includes a set of `scripts/` and a file `handlers.js` that implements the latest AirSwap protocol, both as an example and a dependency of [AirSwap Maker Kit Examples](https://github.com/airswap/airswap-maker-kit-examples). Scripts available in this package include functionality to interact with peers, indexers, and tokens. See [Commands](#commands) below.

### Concepts

- **Quotes** are indicative prices and **Orders** are signed and executable for trading. Makers should be able to provide both.
- **Intent** is an interest in trading including contact information, without pricing. Indexers help you manage intent.
- **Locators** are public URLs shorter than 32 characters in length including URL scheme. This is where your maker runs.

## Using the Commands

### Installation

Requires [Node.js](https://nodejs.org) `^10.13.0` and NPM or [Yarn](https://yarnpkg.com/lang/en/docs/install/).

```
git clone https://github.com/airswap/airswap-maker-kit
cd airswap-maker-kit
yarn install
```

Environment variables are loaded from a `.env` file in the root directory. The following must be set:

- `ETHEREUM_ACCOUNT` - The private key of an account to use for staking and trading.

There is an example `.env-example` that you can copy to `.env` to start with.

### Ethereum Account

To use an existing Ethereum account, set the `ETHEREUM_ACCOUNT` in your `.env` file. Otherwise create a random account using the `yarn utils:account` script. Paste the generated private key into your `.env` file.

### Contract Versions

The Swap and Indexer contracts used by Maker Kit are specified within their respective packages, `@airswap/swap` and `@airswap/indexer` in the [AirSwap Protocols](https://github.com/airswap/airswap-protocols) repository.

### Selecting a Network

By default, Maker Kit will connect to Rinkeby (`4`) for testing. To instead connect to mainnet, set the `CHAIN_ID` in your `.env` file to `1`.

## Commands

| Command               | Description                      |
| :-------------------- | :------------------------------- |
| `yarn`                | Install dependencies             |
| `yarn peers:get`      | Get quotes and orders from peers |
| `yarn indexer:create` | Create a new token pair index    |
| `yarn indexer:enable` | Enable staking on the indexer    |
| `yarn indexer:set`    | Set an intent to trade           |
| `yarn indexer:unset`  | Unset an intent to trade         |
| `yarn indexer:get`    | Get locators                     |
| `yarn token:approve`  | Approve a token for trading      |
| `yarn token:check`    | Check a token approval           |
| `yarn utils:network`  | Get network addresses            |
| `yarn utils:account`  | Create a random account          |

## Helpful for Testing on Rinkeby

- **ETH** to pay for transactions - [Faucet](https://faucet.rinkeby.io/)
- **WETH** for trading - `0xc778417e063141139fce010982780140aa0cd5ab` [Etherscan](https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab)
- **DAI** for trading - `0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea` [Etherscan](https://rinkeby.etherscan.io/address/0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
- **AST** for staking - `0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8` [Etherscan](https://rinkeby.etherscan.io/address/0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8) / [Faucet](https://ast-faucet-ui.development.airswap.io/)

## Quick Start: Quoting

[AirSwap Maker Kit Examples](https://github.com/airswap/airswap-maker-kit-examples) has examples available to get started. For the following guide, start up the [Express](https://github.com/airswap/airswap-maker-kit-examples/tree/master/express) example for Node.js on your local machine.

### Get a quote from your maker

In another shell, run the `yarn peers:get` script to test it out. **Use the default values for everything** but provide a `locator` value of `http://0.0.0.0:3000/` to connect to your newly running maker.

```bash
$ yarn peers:get

AirSwap: Get Quotes and Orders
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2 Rinkeby

Select a kind (quote, order):  (quote)
Select a side (buy, sell):  (buy)
Query a locator (optional):  http://0.0.0.0:3000/
Token to buy:  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Token to pay:  (0xc778417e063141139fce010982780140aa0cd5ab)
Amount to buy:  (100)

Got a Quote

buy: 100 0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
pay: 10 0xc778417e063141139fce010982780140aa0cd5ab
price: 0.1
```

This succeeds because we have a locator in hand, the URL of your local webserver. However, if we do no thave a locator in hand, we need to use an indexer to find other trading parties.

### Set your intent to trade

By default, your maker is running in isolation. Run `peers:get` with default values, which will display `No peers found.`.

```bash
$ yarn peers:get
```

To be found, announce your maker to the world by setting your "intent to trade" on the indexer.

```bash
$ yarn indexer:set

AirSwap: Set Intent to Trade
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2 Rinkeby

Token address of signerToken (maker side):  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Token address of senderToken (taker side):  (0xc778417e063141139fce010982780140aa0cd5ab)
Web address of your server (URL):  (http://10.0.0.169:3000)
Amount of token to stake (AST):  (0)

Set an Intent

signerToken: 0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
senderToken: 0xc778417e063141139fce010982780140aa0cd5ab
locator: http://10.0.0.169:3000
stakeAmount: 0
...
```

The transaction will be mined and your locator is now on the indexer.

```bash
$ yarn indexer:get

AirSwap: Get Locators
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2 Rinkeby

Address of signerToken:  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Address of senderToken:  (0xc778417e063141139fce010982780140aa0cd5ab)
Number of locators to return:  (10)
1. http://10.0.0.169:3000
...
```

### Get quotes from all makers (including yours)

Ensure your maker is still running.

Now run the same `peers:get` with default values, which will display your quote.

```bash
$ yarn peers:get

AirSwap: Get Quotes and Orders
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2

Select a kind (quote, order):  (quote)
Select a side (buy, sell):  (buy)
Query a locator (optional):
Token to buy:  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Token to pay:  (0xc778417e063141139fce010982780140aa0cd5ab)
Amount to buy:  (100)

✓ Quote from http://10.0.0.169:3000 (cost: 10, price: 0.1)
```

## Staking and Trading

### Indexer Staking

Run the `yarn indexer:enable` script to enable staking on an Indexer. You'll use AirSwap Tokens (AST) to stake an intent to trade. On Rinkeby, use the [Rinkeby AST Faucet](https://ast-faucet-ui.development.airswap.io/) to pick up some AST for staking.

```bash
$ yarn indexer:enable

AirSwap: Enable Staking
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2

This will approve the Indexer contract to stake your AST.
...
```

### Token Approvals

Tokens must be approved for trading on the Swap contract. This is a one-time transaction for each token. To approve the Swap contract to transfer your tokens, use the `yarn token:approve` script for both WETH and DAI addresses above. You can check the approval status of any token with the `yarn token:check` script.

## Using as a Package

### Custom Price and Amounts

Using the package to handle API requests, you can provide either the pricing handlers or the pricing data.

```JavaScript
const initializeHandlers = require('@airswap/maker-kit');

const customPrices = {
  [signerToken]: {
    [senderToken]: tokenPairPrice
  },
  ...
};

const customAmounts = {
  [token]: maxAmount,
  ...
};

const handlers = initializeHandlers(PRIVATE_KEY, customPrices, customAmounts)
const result = handlers.getSignerSideQuote(...)
```

### Custom Pricing Functions

```JavaScript
const initializeHandlers = require('@airswap/maker-kit');

const customPricingFunctions = {
  isTradingPair: function(params) { ... }, // Returns true or false for a given token pair.
  priceBuy: function(params) { ... }, // Returns signerParam: An amount we would send the taker in a buy
  priceSell: function(params) { ... }, // Returns senderParam: An amount the taker will send us in a sell
  getMaxParam: function(params) { ... } // Returns maxParam: A maximum amount we are willing to buy or sell
}

const handlers = initializeHandlers(PRIVATE_KEY, false, false, customPricingFunctions)
const result = handlers.getSignerSideQuote(...)
```
