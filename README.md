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

## Helpful for Testing

- **ETH** to pay for transactions - [Faucet](https://faucet.rinkeby.io/)
- **WETH** for trading - `0xc778417e063141139fce010982780140aa0cd5ab` [Etherscan](https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab)
- **DAI** for trading - `0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea` [Etherscan](https://rinkeby.etherscan.io/address/0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
- **AST** for staking - `0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8` [Etherscan](https://rinkeby.etherscan.io/address/0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8) / [Faucet](https://ast-faucet-ui.development.airswap.io/)

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
* [`airswap orders:best`](#airswap-ordersbest)
* [`airswap orders:get`](#airswap-ordersget)
* [`airswap quotes:best`](#airswap-quotesbest)
* [`airswap quotes:get`](#airswap-quotesget)
* [`airswap tokens:approve`](#airswap-tokensapprove)
* [`airswap tokens:update`](#airswap-tokensupdate)
* [`airswap update [CHANNEL]`](#airswap-update-channel)

## `airswap account:generate`

generate a new account

```
USAGE
  $ airswap account:generate
```

_See code: [src/commands/account/generate.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/account/generate.ts)_

## `airswap account:set`

set the current account

```
USAGE
  $ airswap account:set
```

_See code: [src/commands/account/set.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/account/set.ts)_

## `airswap account:show`

show the current account

```
USAGE
  $ airswap account:show
```

_See code: [src/commands/account/show.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/account/show.ts)_

## `airswap account:unset`

unset the current account

```
USAGE
  $ airswap account:unset
```

_See code: [src/commands/account/unset.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/account/unset.ts)_

## `airswap balances`

display token balances

```
USAGE
  $ airswap balances
```

_See code: [src/commands/balances.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/balances.ts)_

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

_See code: [src/commands/intent/enable.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/intent/enable.ts)_

## `airswap intent:get`

get intents from the indexer

```
USAGE
  $ airswap intent:get
```

_See code: [src/commands/intent/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/intent/get.ts)_

## `airswap intent:new`

create an index for a new token pair

```
USAGE
  $ airswap intent:new
```

_See code: [src/commands/intent/new.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/intent/new.ts)_

## `airswap intent:set`

set an intent

```
USAGE
  $ airswap intent:set
```

_See code: [src/commands/intent/set.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/intent/set.ts)_

## `airswap intent:unset`

unset an intent

```
USAGE
  $ airswap intent:unset
```

_See code: [src/commands/intent/unset.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/intent/unset.ts)_

## `airswap ip`

display local network addresses

```
USAGE
  $ airswap ip
```

_See code: [src/commands/ip.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/ip.ts)_

## `airswap network`

set the active network

```
USAGE
  $ airswap network
```

_See code: [src/commands/network.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/network.ts)_

## `airswap orders:best`

get the best available order

```
USAGE
  $ airswap orders:best
```

_See code: [src/commands/orders/best.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/orders/best.ts)_

## `airswap orders:get`

get an order from a peer

```
USAGE
  $ airswap orders:get
```

_See code: [src/commands/orders/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/orders/get.ts)_

## `airswap quotes:best`

get the best available quote

```
USAGE
  $ airswap quotes:best
```

_See code: [src/commands/quotes/best.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/quotes/best.ts)_

## `airswap quotes:get`

get a quote from a peer

```
USAGE
  $ airswap quotes:get
```

_See code: [src/commands/quotes/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/quotes/get.ts)_

## `airswap tokens:approve`

approve a token for trading

```
USAGE
  $ airswap tokens:approve
```

_See code: [src/commands/tokens/approve.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/tokens/approve.ts)_

## `airswap tokens:update`

update local metadata

```
USAGE
  $ airswap tokens:update
```

_See code: [src/commands/tokens/update.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.1-beta/src/commands/tokens/update.ts)_

## `airswap update [CHANNEL]`

update the airswap CLI

```
USAGE
  $ airswap update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.9/src/commands/update.ts)_
<!-- commandsstop -->
