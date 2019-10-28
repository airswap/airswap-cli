# AirSwap Maker Kit

The AirSwap Maker Kit is a set of tools and examples to help you get started on the AirSwap Network.

## Concepts

### Token Values

Everything is in wei.

### Approvals

### Staking and Trading

## Setup

Environment variables are loaded from a `.env` file in the root directory. The following must be set:

- `ETHEREUM_NODE` - The URL of an Ethereum node to connect to.
- `PRIVATE_KEY` - The private key of an account to use for staking.
- `INDEXER_ADDRESS` - The address of an indexer you intend to use.
- `SWAP_ADDRESS` - The address of a swap contract you intend to use.

There is an example `.env-example` that you can rename to `.env` to start with. Latest swap and indexer deployments found at [AirSwap Protocols](https://github.com/airswap/airswap-protocols).

## Quick Start

Let's set up a maker on the Rinkeby testnet to trade WETH/DAI.

### Setup an Ethereum Account

If you have an existing Ethereum account you'd like to use, set the `PRIVATE_KEY` in your `.env` file. Otherwise you can create a random account using the `createAccount` script.

```
yarn createAccount
```

Paste the generated private key into your `.env` file.

### Setup an Ethereum Node

If you have an existing Ethereum node to use, set the `ETHEREUM_NODE` in your `.env` file. Otherwise you can create a free account with INFURA. Navigate to https://infura.io/ to create an account and generate an API key. Your URL will look like this: `https://rinkeby.infura.io/v3/...`

### Approve Tokens for Trade

Rinkeby WETH and DAI tokens can be found at:

```
WETH 0xc778417e063141139fce010982780140aa0cd5ab
DAI  0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
```

To approve the Swap contract to transfer your tokens, use the `approveToken` script for both WETH and DAI. The Swap contract address is loaded from your `.env` file.

```
yarn approveToken
```

You can check the approval status of any token with the `checkApproval` script.

```
yarn checkApproval
```

### Configure Your Maker

The reference Node.js maker is configured to trade WETH/DAI at price 0.1.

```
yarn start
```

Runs your server on port `8080` by default. You'll use this value for the port of your **locator**.

### Announce Your Intent to Trade

Get the local network address with the `getNetworkAddress` command. You'll use this value for the address your **locator**. If there is more than one address, you can use any of them.

```
yarn getNetworkAddress
```

Now that you have the two components of your **locator** (address and port) we'll set an "intent to trade" on the indexer. It should look something like `10.0.0.169:8080`.

```
yarn setIntent
```

## Reference Makers

See the `makers` directory. There is one example for [Node.js](./makers/nodejs) currently available.

## Scripts

### Create a Wallet

Generates a new random Ethereum account:

```
yarn createAccount
```

### Approve a Token

**`TODO`** A guide to approve a token for trading on the Swap contract:

```
yarn approve
```

### Set an Intent to Trade

**`INCOMPLETE`** A guide to set an intent to trade on the Indexer contract:

```
yarn setIntent
```

### Unset an Intent to Trade

**`TODO`** A guide to unset an intent to trade on the Indexer contract:

```
yarn unsetIntent
```

### Get All Intents

**`TODO`** A guide to get all intents to trade on the Indexer contract:

```
yarn getIntents
```
