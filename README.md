# AirSwap Maker Kit

The AirSwap Maker Kit is a set of tools and examples to help you get started on the AirSwap Network.

## Concepts

- **Token Approvals** - The Swap contract must be approved to transfer your tokens.
- **Token Values** - All token values are in the indivisible units of a token (wei).
- **Staking** - You can stake tokens to improve your position on the indexer.
- **Trading** - Your trading account can be different than the staking account.
- **Nonces** - Each order is identified by a unique nonce.

## Setup

Environment variables are loaded from a `.env` file in the root directory. The following must be set:

- `ETHEREUM_NODE` - The URL of an Ethereum node to connect to.
- `PRIVATE_KEY` - The private key of an account to use for staking.
- `INDEXER_ADDRESS` - The address of an indexer you intend to use.
- `SWAP_ADDRESS` - The address of a swap contract you intend to use.

There is an example `.env-example` that you can rename to `.env` to start with. Latest swap and indexer deployments found at [AirSwap Protocols](https://github.com/airswap/airswap-protocols).

## Quick Start

Let's set up a maker on the Rinkeby testnet to trade WETH/DAI.

### Ethereum Account

If you have an existing Ethereum account you'd like to use, set the `PRIVATE_KEY` in your `.env` file. Otherwise you can create a random account using the `yarn createAccount` script. Paste the generated private key into your `.env` file.

### Ethereum Node

If you have an existing Ethereum node to use, set the `ETHEREUM_NODE` in your `.env` file. Otherwise you can create a free account with INFURA. Navigate to https://infura.io/ to create an account and generate an API key. Your URL will look like this: `https://rinkeby.infura.io/v3/...`

### Token Approvals

Tokens must be approved for trading on the Swap contract. This is a one-time requirement for each otken. Rinkeby WETH and DAI tokens can be found the following addresses.

- Rinkeby **WETH** - `0xc778417e063141139fce010982780140aa0cd5ab`
- Rinkeby **DAI** - `0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea`

To approve the Swap contract to transfer your tokens, use the `yarn approveToken` script for both of the above token addresses. The Swap contract address is loaded from your `.env` file. You can check the approval status of any token with the `yarn checkApproval` script.

### Run the Maker

The reference Node.js maker is configured to trade WETH/DAI at price 0.1.

```
$ yarn start
info: Server now listening. (0.0.0.0:8080)
```

In another shell, run the `getBuyQuote` script to test it out.

```
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

Run the `yarn enableStaking` script to enable staking on the Rinkeby indexer. You'll use AirSwap Tokens (AST) to stake an intent to trade. Head over to the Rinkeby AST faucet to pick up some AST for staking.

### Set Intent to Trade

First try on your local area network. Use the `yarn getNetworkAddress` script to determine what your IP address is. If there is more than one address pick one. Now we'll set an "intent to trade" on the indexer. It should look something like `http://10.0.0.169:8080`.

```
yarn setIntent
```
