# AirSwap Maker Kit

The AirSwap Maker Kit is a set of tools and examples to help you get started on the AirSwap Network.

## Setup

Environment variables are loaded from a `.env` file in the root directory. The following must be set:

- `ETHEREUM_NODE` - The URL of an Ethereum node to connect to.
- `PRIVATE_KEY` - The private key of an account to use for staking.
- `INDEXER_ADDRESS` - The address of an indexer you intend to use.

For the latest indexer deployments see the [AirSwap Protocols](https://github.com/airswap/airswap-protocols) repository.

## Examples

See the `examples` directory. There is one example for [Node](./examples/node) currently available.

## Tools

### Create a Wallet

Generates a new random Ethereum account:

```
yarn createWallet
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
