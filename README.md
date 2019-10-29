# AirSwap Maker Kit

Maker Kit includes tools and examples to help you get started on the AirSwap Network.

[![Discord](https://img.shields.io/discord/590643190281928738.svg)](https://discord.gg/ecQbV7H)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![Twitter Follow](https://img.shields.io/twitter/follow/airswap?style=social)

- Docs → https://docs.airswap.io/
- Website → https://www.airswap.io/
- Blog → https://blog.airswap.io/
- Support → https://support.airswap.io/

## Concepts

AirSwap is a peer to peer trading network for Ethereum (ERC20, ERC721) tokens. Using an Indexer smart contract, peers find each other based on their mutual intent to trade specific tokens. Once found, peers exchange pricing information and settle trades on the Swap contract.

- **Token Approvals** - The Swap contract must be approved to transfer your tokens.
- **Token Values** - All token values are in the indivisible units of a token (wei).
- **Staking** - You can stake tokens to improve your position on the indexer.
- **Trading** - Your trading account can be different than the staking account.
- **Nonces** - Each order is identified by a unique nonce.

## Setup

Requires Node.js `v8.6.0` or above. Check out the [Node.js website](https://nodejs.org) to install the latest. Environment variables are loaded from a `.env` file in the root directory. The following must be set:

- `PRIVATE_KEY` - The private key of an account to use for staking.
- `ETHEREUM_NODE` - The URL of an Ethereum node to connect to.
- `INDEXER_ADDRESS` - The address of an Indexer you intend to use.
- `SWAP_ADDRESS` - The address of a Swap contract you intend to use.

There is an example `.env-example` that you can rename to `.env` to start with. Latest Swap and Indexer deployments found on [AirSwap Docs](https://docs.airswap.io/).

## Quick Start

Let's set up a maker on the Rinkeby testnet to trade WETH/DAI.

### Ethereum Account

If you have an existing Ethereum account to use, set the `PRIVATE_KEY` in your `.env` file. Otherwise create a random account using the `yarn createAccount` script. Paste the generated private key into your `.env` file. You'll need some Rinkeby ether (ETH) to execute transactions, which you can get at the [Rinkeby ETH faucet](https://faucet.rinkeby.io/).

### Ethereum Node

If you have an existing Ethereum node to use, set the `ETHEREUM_NODE` in your `.env` file. Otherwise you can create a free account with INFURA. Navigate to https://infura.io/ to create an account and generate an API key. Your URL will look like this: `https://rinkeby.infura.io/v3/...`

### Token Approvals

Tokens must be approved for trading on the Swap contract. This is a one-time transaction for each token. Rinkeby WETH and DAI tokens can be found the following addresses.

- Rinkeby **WETH** - [`0xc778417e063141139fce010982780140aa0cd5ab`](https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab)
- Rinkeby **DAI** - [`0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea`](https://rinkeby.etherscan.io/address/0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)

To approve the Swap contract to transfer your tokens, use the `yarn approveToken` script for both WETH and DAI above. The Swap contract address is loaded from your `.env` file. You can check the approval status of any token with the `yarn checkApproval` script.

### Run the Maker

The reference Node.js maker is configured to trade WETH/DAI at price 0.1 at port 8080.

```bash
$ yarn start
info: Server now listening. (0.0.0.0:8080)
```

In another shell, run the `getBuyQuote` script to test it out.

```bash
$ yarn getBuyQuote

AirSwap: Get a Quote

Locator to query:  (http://localhost:8080)
Amount of token to buy:  (100)
Address of token to buy:  (0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
Address of token to spend:  (0xc778417e063141139fce010982780140aa0cd5ab)

Got a Quote

Buying 100 0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
Cost   10 0xc778417e063141139fce010982780140aa0cd5ab
Price  0.1
```

### Enable Staking

Run the `yarn enableStaking` script to enable staking on the Rinkeby Indexer. You'll use AirSwap Tokens (AST) to stake an intent to trade. Head over to the [Rinkeby AST faucet](https://ast-faucet-ui.development.airswap.io/) to pick up some AST for staking.

### Set Intent to Trade

First try on your local area network. Use the `yarn getNetworkAddress` script to determine what your IP address is. If there is more than one address pick one. Now we'll set an "intent to trade" on the Indexer. Your locator should look something like this: `http://10.0.0.169:8080`.

```bash
$ yarn setIntent

AirSwap: Set Intent to Trade
Current account 0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2

Select a network (rinkeby, mainnet):  (rinkeby)
Token address of signerToken (maker side):  0xc778417e063141139fce010982780140aa0cd5ab
Token address of senderToken (taker side):  0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
Web address of your server (URL):  http://localhost:8080/
Amount of token to stake (AST):  1

Set an Intent

signerToken: 0xc778417e063141139fce010982780140aa0cd5ab
senderToken: 0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
locator: http://localhost:8080/
stakeAmount: 1

Type yes to send transaction:  yes
```

### All Together Now

```bash
yarn getAllBuyQuotes


```
