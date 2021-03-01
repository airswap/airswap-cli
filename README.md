# AirSwap CLI

Command Line Interface (CLI) for the AirSwap Network

[![Version](https://img.shields.io/npm/v/airswap.svg)](https://npmjs.org/package/airswap)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Downloads/week](https://img.shields.io/npm/dw/airswap.svg)](https://npmjs.org/package/airswap)
[![Discord](https://img.shields.io/discord/590643190281928738.svg)](https://discord.gg/ecQbV7H)
![Twitter Follow](https://img.shields.io/twitter/follow/airswap?style=social)

- Docs → https://docs.airswap.io/
- Website → https://www.airswap.io/
- Blog → https://blog.airswap.io/
- Support → https://support.airswap.io/

AirSwap is a peer-to-peer trading network for Ethereum (ERC20, ERC721) tokens. Using an Indexer smart contract, peers can find each other based on their mutual intent to trade specific tokens. Once found, peers exchange pricing information and settle trades on a Swap contract. AirSwap CLI includes functionality to interact with peers, indexers, and tokens. See [Commands](#commands) below.

**Concepts**

- Quotes are indicative prices and orders are signed and executable. Makers should be able to provide both.
- Makers run as web servers at public URLs. Takers request quotes and orders using JSON-RPC over HTTP.
- Indexers are used to signal an intent to trade to other peers. Tokens are staked to improve visibility.

**Key Management**

AirSwap CLI uses the native password manager of your system. On macOS, keys are managed by the Keychain, on Linux they are managed by the Secret Service API/libsecret, and on Windows they are managed by Credential Vault.

# Quick Start

Install the CLI globally

```
$ yarn global add airswap
```

Create a new account to use for the CLI (recommended)

```
$ airswap account:generate
```

Import the newly generated or an existing private key

```
$ airswap account:import
```

# Explore the Network

Set the active Ethereum chain

```
$ airswap chain
```

Get locators for actively trading peers

```
$ airswap indexer:get
```

Get a quote from a specific peer

```
$ airswap quote:get
```

Get the best quote from all peers

```
$ airswap quote:best
```

# Balance Management

Get balances for known tokens

```
$ airswap balances
```

Transfer a balance to another account

```
$ airswap token:transfer
```

Deposit an ETH balance to WETH

```
$ airswap weth:deposit
```

Withdraw an ETH balance from WETH

```
$ airswap weth:withdraw
```

# Rinkeby Resources

- **ETH** to pay for transactions - [Faucet](https://faucet.rinkeby.io/)
- **WETH** for trading - `0xc778417e063141139fce010982780140aa0cd5ab` [Etherscan](https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab)
- **DAI** for trading - `0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea` [Etherscan](https://rinkeby.etherscan.io/address/0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea)
- **AST** for staking - `0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8` [Etherscan](https://rinkeby.etherscan.io/address/0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8) / [Faucet](https://ast-faucet-ui.development.airswap.io/)

# All Commands

<!-- commands -->
* [`airswap account:delete`](#airswap-accountdelete)
* [`airswap account:export`](#airswap-accountexport)
* [`airswap account:generate`](#airswap-accountgenerate)
* [`airswap account:import`](#airswap-accountimport)
* [`airswap balances`](#airswap-balances)
* [`airswap chain`](#airswap-chain)
* [`airswap debug`](#airswap-debug)
* [`airswap gas`](#airswap-gas)
* [`airswap help [COMMAND]`](#airswap-help-command)
* [`airswap indexer:enable`](#airswap-indexerenable)
* [`airswap indexer:get`](#airswap-indexerget)
* [`airswap indexer:new`](#airswap-indexernew)
* [`airswap indexer:set`](#airswap-indexerset)
* [`airswap indexer:unset`](#airswap-indexerunset)
* [`airswap ip`](#airswap-ip)
* [`airswap metadata:add`](#airswap-metadataadd)
* [`airswap metadata:delete`](#airswap-metadatadelete)
* [`airswap metadata:lookup`](#airswap-metadatalookup)
* [`airswap metadata:update`](#airswap-metadataupdate)
* [`airswap order:best`](#airswap-orderbest)
* [`airswap order:get`](#airswap-orderget)
* [`airswap quote:best`](#airswap-quotebest)
* [`airswap quote:get`](#airswap-quoteget)
* [`airswap quote:max`](#airswap-quotemax)
* [`airswap token:approve`](#airswap-tokenapprove)
* [`airswap token:transfer`](#airswap-tokentransfer)
* [`airswap weth:deposit`](#airswap-wethdeposit)
* [`airswap weth:withdraw`](#airswap-wethwithdraw)

## `airswap account:delete`

delete the current ethereum account

```
delete the current ethereum account

USAGE
  $ airswap account:delete
```

_See code: [src/commands/account/delete.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/account/delete.ts)_

## `airswap account:export`

export the current ethereum account

```
export the current ethereum account

USAGE
  $ airswap account:export
```

_See code: [src/commands/account/export.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/account/export.ts)_

## `airswap account:generate`

generate a new ethereum account

```
generate a new ethereum account

USAGE
  $ airswap account:generate
```

_See code: [src/commands/account/generate.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/account/generate.ts)_

## `airswap account:import`

import an ethereum account

```
import an ethereum account

USAGE
  $ airswap account:import
```

_See code: [src/commands/account/import.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/account/import.ts)_

## `airswap balances`

display token balances

```
display token balances

USAGE
  $ airswap balances
```

_See code: [src/commands/balances.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/balances.ts)_

## `airswap chain`

set the active ethereum chain

```
set the active ethereum chain

USAGE
  $ airswap chain
```

_See code: [src/commands/chain.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/chain.ts)_

## `airswap debug`

debug a transaction given its input data

```
debug a transaction given its input data

USAGE
  $ airswap debug
```

_See code: [src/commands/debug.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/debug.ts)_

## `airswap gas`

set gas price for transactions

```
set gas price for transactions

USAGE
  $ airswap gas
```

_See code: [src/commands/gas.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/gas.ts)_

## `airswap help [COMMAND]`

display help for airswap

```
display help for <%= config.bin %>

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
enable staking on the indexer

USAGE
  $ airswap indexer:enable
```

_See code: [src/commands/indexer/enable.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/indexer/enable.ts)_

## `airswap indexer:get`

get intents from the indexer

```
get intents from the indexer

USAGE
  $ airswap indexer:get
```

_See code: [src/commands/indexer/get.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/indexer/get.ts)_

## `airswap indexer:new`

create an index for a new token pair

```
create an index for a new token pair

USAGE
  $ airswap indexer:new
```

_See code: [src/commands/indexer/new.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/indexer/new.ts)_

## `airswap indexer:set`

set an intent

```
set an intent

USAGE
  $ airswap indexer:set
```

_See code: [src/commands/indexer/set.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/indexer/set.ts)_

## `airswap indexer:unset`

unset an intent

```
unset an intent

USAGE
  $ airswap indexer:unset
```

_See code: [src/commands/indexer/unset.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/indexer/unset.ts)_

## `airswap ip`

display local network addresses

```
display local network addresses

USAGE
  $ airswap ip
```

_See code: [src/commands/ip.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/ip.ts)_

## `airswap metadata:add`

add token to local metadata

```
add token to local metadata

USAGE
  $ airswap metadata:add
```

_See code: [src/commands/metadata/add.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/metadata/add.ts)_

## `airswap metadata:delete`

delete token from local metadata

```
delete token from local metadata

USAGE
  $ airswap metadata:delete
```

_See code: [src/commands/metadata/delete.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/metadata/delete.ts)_

## `airswap metadata:lookup`

lookup token in local metadata

```
lookup token in local metadata

USAGE
  $ airswap metadata:lookup
```

_See code: [src/commands/metadata/lookup.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/metadata/lookup.ts)_

## `airswap metadata:update`

update local metadata from remote sources

```
update local metadata from remote sources

USAGE
  $ airswap metadata:update
```

_See code: [src/commands/metadata/update.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/metadata/update.ts)_

## `airswap order:best`

get the best available order

```
get the best available order

USAGE
  $ airswap order:best
```

_See code: [src/commands/order/best.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/order/best.ts)_

## `airswap order:get`

get an order from a peer

```
get an order from a peer

USAGE
  $ airswap order:get
```

_See code: [src/commands/order/get.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/order/get.ts)_

## `airswap quote:best`

get the best available quote

```
get the best available quote

USAGE
  $ airswap quote:best
```

_See code: [src/commands/quote/best.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/quote/best.ts)_

## `airswap quote:get`

get a quote from a peer

```
get a quote from a peer

USAGE
  $ airswap quote:get
```

_See code: [src/commands/quote/get.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/quote/get.ts)_

## `airswap quote:max`

get a max quote from a peer

```
get a max quote from a peer

USAGE
  $ airswap quote:max
```

_See code: [src/commands/quote/max.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/quote/max.ts)_

## `airswap token:approve`

approve a token for trading

```
approve a token for trading

USAGE
  $ airswap token:approve
```

_See code: [src/commands/token/approve.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/token/approve.ts)_

## `airswap token:transfer`

transfer tokens to another account

```
transfer tokens to another account

USAGE
  $ airswap token:transfer
```

_See code: [src/commands/token/transfer.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/token/transfer.ts)_

## `airswap weth:deposit`

deposit eth to weth

```
deposit eth to weth

USAGE
  $ airswap weth:deposit
```

_See code: [src/commands/weth/deposit.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/weth/deposit.ts)_

## `airswap weth:withdraw`

withdraw eth from weth

```
withdraw eth from weth

USAGE
  $ airswap weth:withdraw
```

_See code: [src/commands/weth/withdraw.ts](https://github.com/airswap/airswap-cli/blob/v1.3.13/src/commands/weth/withdraw.ts)_
<!-- commandsstop -->
