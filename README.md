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

- **Quotes** are indicative prices and **Orders** are signed and executable for trading.
- **Intent** is an interest in trading including contact information, without pricing.
- **Locators** indicate how to connect to a peer. On AirSwap Instant, locators are web URLs.

## Setup

### Installation

Requires Node.js `v8.10.0` or above. Check out the [Node.js website](https://nodejs.org) to install the latest. Clone the repository and install dependencies:

```
git clone https://github.com/airswap/airswap-maker-kit
cd airswap-maker-kit
yarn install
```

Environment variables are loaded from a `.env` file in the root directory. The following must be set:

- `ETHEREUM_ACCOUNT` - The private key of an account to use for staking and trading.
- `ETHEREUM_NODE` - The URL of an Ethereum node to connect to.

There is an example `.env-example` that you can copy to `.env` to start with. Latest Swap and Indexer deployments found on [AirSwap Docs](https://docs.airswap.io/).

### Ethereum Account

To use an existing Ethereum account, set the `ETHEREUM_ACCOUNT` in your `.env` file. Otherwise create a random account using the `yarn utils:account` script. Paste the generated private key into your `.env` file.

### Ethereum Node

To use an existing Ethereum node, set the `ETHEREUM_NODE` in your `.env` file. Otherwise you can create a free account with INFURA. Navigate to https://infura.io/ to create an account and generate an API key and URL.

### Contract Versions

The Swap and Indexer contracts used by Maker Kit are specified within their respective packages, `@airswap/swap` and `@airswap/indexer` in the [AirSwap Protocols](https://github.com/airswap/airswap-protocols) repository.

## Helpful for Testing on Rinkeby

- **ETH** to pay for transactions - [ETH Faucet](https://faucet.rinkeby.io/)
- **WETH** for trading - `0xc778417e063141139fce010982780140aa0cd5ab` [Etherscan](https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab)
- **DAI** for trading - `0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea` [Etherscan](https://rinkeby.etherscan.io/address/0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
- **AST** for staking - [AST Faucet](https://ast-faucet-ui.development.airswap.io/)

## Quick Start: Quoting

The reference Node.js maker is configured to quote `WETH/DAI` at price `0.1` on port `8080`.

### Test and start your maker

First run the tests to check that they pass.

```bash
$ yarn maker:test
```

All should clear. Now start up the maker to accept start accepting requests.

```bash
$ yarn maker:start
info: Server now listening. (0.0.0.0:8080)
```

### Get a quote from your maker

In another shell, run the `yarn peers:get` script to test it out. **Use the default values for everything** but provide a `locator` value of `http://0.0.0.0:8080/` to connect to your newly running maker.

```bash
$ yarn peers:get

AirSwap: Get Quotes and Orders
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2

Select a network (rinkeby, mainnet):  (rinkeby)
Select a kind (quote, order):  (quote)
Select a side (buy, sell):  (buy)
Query a locator (optional):  http://0.0.0.0:8080/
Token to buy:  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Token to pay:  (0xc778417e063141139fce010982780140aa0cd5ab)
Amount to buy:  (100)

Got a Quote

buy: 100 0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
pay: 10 0xc778417e063141139fce010982780140aa0cd5ab
price: 0.1
```

This succeeds because we have a locator in hand, the URL of your local webserver. However, if we do no thave a locator in hand, we need to use an Indexer to find other trading parties.

### Set your intent to trade

By default, your maker is running in isolation. Run `peers:get` with default values, which will display `No peers found.`.

```bash
$ yarn peers:get
```

To be found, announce your maker to the world by setting your "intent to trade" on the Indexer.

```bash
$ yarn indexer:set

AirSwap: Set Intent to Trade
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2

Select a network (rinkeby, mainnet):  (rinkeby)
Token address of signerToken (maker side):  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Token address of senderToken (taker side):  (0xc778417e063141139fce010982780140aa0cd5ab)
Web address of your server (URL):  (http://10.0.0.169:8080)
Amount of token to stake (AST):  (0)

Set an Intent

signerToken: 0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
senderToken: 0xc778417e063141139fce010982780140aa0cd5ab
locator: http://10.0.0.169:8080
stakeAmount: 0
...
```

The transaction will be mined and your locator is now on the Indexer.

```bash
$ yarn indexer:get

AirSwap: Get Locators
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2

Select a network (rinkeby, mainnet):  (rinkeby)
Address of signerToken:  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Address of senderToken:  (0xc778417e063141139fce010982780140aa0cd5ab)
Number of locators to return:  (10)
1. http://10.0.0.169:8080
...
```

### Get quotes from all makers (including yours)

Ensure your maker is still running.

Now run the same `peers:get` with default values, which will display your quote.

```bash
$ yarn peers:get

AirSwap: Get Quotes and Orders
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2

Select a network (rinkeby, mainnet):  (rinkeby)
Select a kind (quote, order):  (quote)
Select a side (buy, sell):  (buy)
Query a locator (optional):
Token to buy:  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Token to pay:  (0xc778417e063141139fce010982780140aa0cd5ab)
Amount to buy:  (100)

✓ Quote from http://10.0.0.169:8080 (cost: 10, price: 0.1)
```

## Advanced: Staking and Trading

### Important Notes

- **Locators** - Makers must be accessible at public endpoints shorter than 32 characters in length including a URL scheme. For example `https://maker.example.com:8000` or `http://99.84.41.93`.
- **Token Values** - All token values are in the indivisible units of a token (wei).
- **Nonce Window** - Each order is identified by a unique nonce. The nonce window is the time within which every order returned will include the same nonce. This can be configured to prevent overexposure.
- **Trading ETH** - Swap only supports tokens, not native ether (ETH). To trade ETH it must be wrapped (WETH).

### Indexer Staking

Run the `yarn indexer:enable` script to enable staking on an Indexer. You'll use AirSwap Tokens (AST) to stake an intent to trade. On Rinkeby, use the [Rinkeby AST Faucet](https://ast-faucet-ui.development.airswap.io/) to pick up some AST for staking.

```bash
$ yarn indexer:enable

AirSwap: Enable Staking
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2

Select a network (rinkeby, mainnet):  (rinkeby)

This will approve the Indexer contract to stake your AST.
...
```

### Token Approvals

Tokens must be approved for trading on the Swap contract. This is a one-time transaction for each token. To approve the Swap contract to transfer your tokens, use the `yarn token:approve` script for both WETH and DAI addresses above. The Swap contract address is loaded from your `.env` file. You can check the approval status of any token with the `yarn token:check` script.

## Commands

| Command               | Description                 |
| :-------------------- | :-------------------------- |
| `yarn`                | Install dependencies        |
| `yarn maker:test`     | Run maker tests             |
| `yarn maker:start`    | Start the maker             |
| `yarn indexer:create` | Create a token pair         |
| `yarn indexer:enable` | Enable staking              |
| `yarn indexer:set`    | Set an intent to trade      |
| `yarn indexer:unset`  | Unset an intent to trade    |
| `yarn indexer:get`    | Get locators                |
| `yarn token:approve`  | Approve a token for trading |
| `yarn token:check`    | Check a token approval      |
| `yarn utils:network`  | Get network addresses       |
| `yarn utils:account`  | Create a random account     |
