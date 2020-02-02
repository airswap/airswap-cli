# AirSwap CLI

Command Line Interface (CLI) for the AirSwap Network

[![Version](https://img.shields.io/npm/v/airswap.svg)](https://npmjs.org/package/airswap-maker-kit)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Downloads/week](https://img.shields.io/npm/dw/airswap.svg)](https://npmjs.org/package/airswap)
[![Discord](https://img.shields.io/discord/590643190281928738.svg)](https://discord.gg/ecQbV7H)
![Twitter Follow](https://img.shields.io/twitter/follow/airswap?style=social)

- Docs → https://docs.airswap.io/
- Website → https://www.airswap.io/
- Blog → https://blog.airswap.io/
- Support → https://support.airswap.io/

AirSwap is a peer-to-peer trading network for Ethereum (ERC20, ERC721) tokens. Using an Indexer smart contract, peers can find each other based on their mutual intent to trade specific tokens. Once found, peers exchange pricing information and settle trades on a Swap contract. AirSwap CLI includes functionality to interact with peers, indexers, and tokens. See [Commands](#commands) below.

# Installation

```
yarn add global airswap
```

## Key Management

AirSwap CLI uses the native password manager of your system. On macOS, keys are managed by the Keychain, on Linux they are managed by the Secret Service API/libsecret, and on Windows they are managed by Credential Vault.

# Commands

<!-- commands -->
* [`airswap account:delete`](#airswap-accountdelete)
* [`airswap account:export`](#airswap-accountexport)
* [`airswap account:generate`](#airswap-accountgenerate)
* [`airswap account:import`](#airswap-accountimport)
* [`airswap balances`](#airswap-balances)
* [`airswap help [COMMAND]`](#airswap-help-command)
* [`airswap indexer:enable`](#airswap-indexerenable)
* [`airswap indexer:get`](#airswap-indexerget)
* [`airswap indexer:new`](#airswap-indexernew)
* [`airswap indexer:set`](#airswap-indexerset)
* [`airswap indexer:unset`](#airswap-indexerunset)
* [`airswap ip`](#airswap-ip)
* [`airswap network`](#airswap-network)
* [`airswap order:best`](#airswap-orderbest)
* [`airswap order:get`](#airswap-orderget)
* [`airswap quote:best`](#airswap-quotebest)
* [`airswap quote:get`](#airswap-quoteget)
* [`airswap quote:max`](#airswap-quotemax)
* [`airswap token:add`](#airswap-tokenadd)
* [`airswap token:approve`](#airswap-tokenapprove)
* [`airswap token:fetch`](#airswap-tokenfetch)

## `airswap account:delete`

delete the current ethereum account

```
USAGE
  $ airswap account:delete
```

_See code: [src/commands/account/delete.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/account/delete.ts)_

## `airswap account:export`

export the current ethereum account

```
USAGE
  $ airswap account:export
```

_See code: [src/commands/account/export.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/account/export.ts)_

## `airswap account:generate`

generate a new ethereum account

```
USAGE
  $ airswap account:generate
```

_See code: [src/commands/account/generate.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/account/generate.ts)_

## `airswap account:import`

import an ethereum account

```
USAGE
  $ airswap account:import
```

_See code: [src/commands/account/import.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/account/import.ts)_

## `airswap balances`

display token balances

```
USAGE
  $ airswap balances
```

_See code: [src/commands/balances.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/balances.ts)_

## `airswap help [COMMAND]`

display help for airswap

```
USAGE
  $ airswap help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `airswap indexer:enable`

enable staking on the indexer

```
USAGE
  $ airswap indexer:enable
```

_See code: [src/commands/indexer/enable.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/indexer/enable.ts)_

## `airswap indexer:get`

get intents from the indexer

```
USAGE
  $ airswap indexer:get
```

_See code: [src/commands/indexer/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/indexer/get.ts)_

## `airswap indexer:new`

create an index for a new token pair

```
USAGE
  $ airswap indexer:new
```

_See code: [src/commands/indexer/new.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/indexer/new.ts)_

## `airswap indexer:set`

set an intent

```
USAGE
  $ airswap indexer:set
```

_See code: [src/commands/indexer/set.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/indexer/set.ts)_

## `airswap indexer:unset`

unset an intent

```
USAGE
  $ airswap indexer:unset
```

_See code: [src/commands/indexer/unset.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/indexer/unset.ts)_

## `airswap ip`

display local network addresses

```
USAGE
  $ airswap ip
```

_See code: [src/commands/ip.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/ip.ts)_

## `airswap network`

set the active network

```
USAGE
  $ airswap network
```

_See code: [src/commands/network.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/network.ts)_

## `airswap order:best`

get the best available order

```
USAGE
  $ airswap order:best
```

_See code: [src/commands/order/best.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/order/best.ts)_

## `airswap order:get`

get an order from a peer

```
USAGE
  $ airswap order:get
```

_See code: [src/commands/order/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/order/get.ts)_

## `airswap quote:best`

get the best available quote

```
USAGE
  $ airswap quote:best
```

_See code: [src/commands/quote/best.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/quote/best.ts)_

## `airswap quote:get`

get a quote from a peer

```
USAGE
  $ airswap quote:get
```

_See code: [src/commands/quote/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/quote/get.ts)_

## `airswap quote:max`

get a max quote from a peer

```
USAGE
  $ airswap quote:max
```

_See code: [src/commands/quote/max.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/quote/max.ts)_

## `airswap token:add`

add token to local metadata

```
USAGE
  $ airswap token:add
```

_See code: [src/commands/token/add.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/token/add.ts)_

## `airswap token:approve`

approve a token for trading

```
USAGE
  $ airswap token:approve
```

_See code: [src/commands/token/approve.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/token/approve.ts)_

## `airswap token:fetch`

update local metadata

```
USAGE
  $ airswap token:fetch
```

_See code: [src/commands/token/fetch.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.1.4/src/commands/token/fetch.ts)_
<!-- commandsstop -->

## Helpful for Testing

- **ETH** to pay for transactions - [Faucet](https://faucet.rinkeby.io/)
- **WETH** for trading - `0xc778417e063141139fce010982780140aa0cd5ab` [Etherscan](https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab)
- **DAI** for trading - `0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea` [Etherscan](https://rinkeby.etherscan.io/address/0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
- **AST** for staking - `0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8` [Etherscan](https://rinkeby.etherscan.io/address/0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8) / [Faucet](https://ast-faucet-ui.development.airswap.io/)
