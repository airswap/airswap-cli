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
* [`airswap account:generate`](#airswap-accountgenerate)
* [`airswap account:set`](#airswap-accountset)
* [`airswap account:show`](#airswap-accountshow)
* [`airswap account:unset`](#airswap-accountunset)
* [`airswap balances`](#airswap-balances)
* [`airswap help [COMMAND]`](#airswap-help-command)
* [`airswap intent:enable`](#airswap-intentenable)
* [`airswap intent:get`](#airswap-intentget)
* [`airswap intent:new`](#airswap-intentnew)
* [`airswap intent:set`](#airswap-intentset)
* [`airswap intent:unset`](#airswap-intentunset)
* [`airswap ip`](#airswap-ip)
* [`airswap network`](#airswap-network)
* [`airswap order:best`](#airswap-orderbest)
* [`airswap order:get`](#airswap-orderget)
* [`airswap quote:best`](#airswap-quotebest)
* [`airswap quote:get`](#airswap-quoteget)
* [`airswap token:approve`](#airswap-tokenapprove)
* [`airswap token:fetch`](#airswap-tokenfetch)
* [`airswap update [CHANNEL]`](#airswap-update-channel)

## `airswap account:generate`

generate a new ethereum account

```
USAGE
  $ airswap account:generate
```

_See code: [src/commands/account/generate.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/account/generate.ts)_

## `airswap account:set`

set the current ethereum account

```
USAGE
  $ airswap account:set
```

_See code: [src/commands/account/set.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/account/set.ts)_

## `airswap account:show`

show the current ethereum account

```
USAGE
  $ airswap account:show
```

_See code: [src/commands/account/show.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/account/show.ts)_

## `airswap account:unset`

unset the current ethereum account

```
USAGE
  $ airswap account:unset
```

_See code: [src/commands/account/unset.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/account/unset.ts)_

## `airswap balances`

display token balances

```
USAGE
  $ airswap balances
```

_See code: [src/commands/balances.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/balances.ts)_

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

## `airswap intent:enable`

enable staking on the indexer

```
USAGE
  $ airswap intent:enable
```

_See code: [src/commands/intent/enable.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/intent/enable.ts)_

## `airswap intent:get`

get intents from the indexer

```
USAGE
  $ airswap intent:get
```

_See code: [src/commands/intent/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/intent/get.ts)_

## `airswap intent:new`

create an index for a new token pair

```
USAGE
  $ airswap intent:new
```

_See code: [src/commands/intent/new.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/intent/new.ts)_

## `airswap intent:set`

set an intent

```
USAGE
  $ airswap intent:set
```

_See code: [src/commands/intent/set.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/intent/set.ts)_

## `airswap intent:unset`

unset an intent

```
USAGE
  $ airswap intent:unset
```

_See code: [src/commands/intent/unset.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/intent/unset.ts)_

## `airswap ip`

display local network addresses

```
USAGE
  $ airswap ip
```

_See code: [src/commands/ip.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/ip.ts)_

## `airswap network`

set the active network

```
USAGE
  $ airswap network
```

_See code: [src/commands/network.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/network.ts)_

## `airswap order:best`

get the best available order

```
USAGE
  $ airswap order:best
```

_See code: [src/commands/order/best.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/order/best.ts)_

## `airswap order:get`

get an order from a peer

```
USAGE
  $ airswap order:get
```

_See code: [src/commands/order/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/order/get.ts)_

## `airswap quote:best`

get the best available quote

```
USAGE
  $ airswap quote:best
```

_See code: [src/commands/quote/best.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/quote/best.ts)_

## `airswap quote:get`

get a quote from a peer

```
USAGE
  $ airswap quote:get
```

_See code: [src/commands/quote/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/quote/get.ts)_

## `airswap token:approve`

approve a token for trading

```
USAGE
  $ airswap token:approve
```

_See code: [src/commands/token/approve.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/token/approve.ts)_

## `airswap token:fetch`

update local metadata

```
USAGE
  $ airswap token:fetch
```

_See code: [src/commands/token/fetch.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.6/src/commands/token/fetch.ts)_

## `airswap update [CHANNEL]`

update the airswap CLI

```
USAGE
  $ airswap update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.9/src/commands/update.ts)_
<!-- commandsstop -->

## Helpful for Testing

- **ETH** to pay for transactions - [Faucet](https://faucet.rinkeby.io/)
- **WETH** for trading - `0xc778417e063141139fce010982780140aa0cd5ab` [Etherscan](https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab)
- **DAI** for trading - `0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea` [Etherscan](https://rinkeby.etherscan.io/address/0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
- **AST** for staking - `0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8` [Etherscan](https://rinkeby.etherscan.io/address/0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8) / [Faucet](https://ast-faucet-ui.development.airswap.io/)
