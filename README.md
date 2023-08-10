# AirSwap CLI

Command Line Interface (CLI) for the AirSwap Network

[![Version](https://img.shields.io/npm/v/airswap.svg)](https://npmjs.org/package/airswap)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Downloads/week](https://img.shields.io/npm/dw/airswap.svg)](https://npmjs.org/package/airswap)
[![Discord](https://img.shields.io/discord/590643190281928738.svg)](https://discord.gg/ecQbV7H)
![Twitter Follow](https://img.shields.io/twitter/follow/airswap?style=social)

- About → https://about.airswap.io/
- Website → https://www.airswap.io/
- Blog → https://blog.airswap.io/

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

Set the active chain ([ChainIds](https://github.com/airswap/airswap-protocols/blob/8ddcacf9ab7b9b5778e5003c56564e7ae55afc9c/tools/constants/index.ts#L28))

```
$ airswap chain
```

Get URLs for active servers

```
$ airswap registry:get
```

Get a quote from a specific peer

```
$ airswap rfq:get
```

Get the best quote from all peers

```
$ airswap rfq:best
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

Deposit a native balance (e.g. ETH) into wrapped (e.g. WETH)

```
$ airswap wrapped:deposit
```

Withdraw a native balance from wrapped

```
$ airswap wrapped:withdraw
```

# All Commands

<!-- commands -->
* [`airswap account:delete`](#airswap-accountdelete)
* [`airswap account:export`](#airswap-accountexport)
* [`airswap account:generate`](#airswap-accountgenerate)
* [`airswap account:import`](#airswap-accountimport)
* [`airswap balances`](#airswap-balances)
* [`airswap chain`](#airswap-chain)
* [`airswap gas`](#airswap-gas)
* [`airswap help [COMMANDS]`](#airswap-help-commands)
* [`airswap ip`](#airswap-ip)
* [`airswap metadata:add`](#airswap-metadataadd)
* [`airswap metadata:delete`](#airswap-metadatadelete)
* [`airswap metadata:lookup`](#airswap-metadatalookup)
* [`airswap metadata:update`](#airswap-metadataupdate)
* [`airswap registry:add`](#airswap-registryadd)
* [`airswap registry:enable`](#airswap-registryenable)
* [`airswap registry:get`](#airswap-registryget)
* [`airswap registry:list`](#airswap-registrylist)
* [`airswap registry:remove`](#airswap-registryremove)
* [`airswap registry:url`](#airswap-registryurl)
* [`airswap rfq:best`](#airswap-rfqbest)
* [`airswap rfq:get`](#airswap-rfqget)
* [`airswap stream:open`](#airswap-streamopen)
* [`airswap token:approve`](#airswap-tokenapprove)
* [`airswap token:revoke`](#airswap-tokenrevoke)
* [`airswap token:transfer`](#airswap-tokentransfer)
* [`airswap wrapped:deposit`](#airswap-wrappeddeposit)
* [`airswap wrapped:withdraw`](#airswap-wrappedwithdraw)

## `airswap account:delete`

delete the current ethereum account

```
USAGE
  $ airswap account:delete

DESCRIPTION
  delete the current ethereum account
```

_See code: [src/commands/account/delete.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/account/delete.ts)_

## `airswap account:export`

export the current ethereum account

```
USAGE
  $ airswap account:export

DESCRIPTION
  export the current ethereum account
```

_See code: [src/commands/account/export.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/account/export.ts)_

## `airswap account:generate`

generate a new ethereum account

```
USAGE
  $ airswap account:generate

DESCRIPTION
  generate a new ethereum account
```

_See code: [src/commands/account/generate.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/account/generate.ts)_

## `airswap account:import`

import an ethereum account

```
USAGE
  $ airswap account:import

DESCRIPTION
  import an ethereum account
```

_See code: [src/commands/account/import.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/account/import.ts)_

## `airswap balances`

display token balances

```
USAGE
  $ airswap balances

DESCRIPTION
  display token balances
```

_See code: [src/commands/balances.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/balances.ts)_

## `airswap chain`

set the active ethereum chain

```
USAGE
  $ airswap chain

DESCRIPTION
  set the active ethereum chain
```

_See code: [src/commands/chain.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/chain.ts)_

## `airswap gas`

set gas price for transactions

```
USAGE
  $ airswap gas

DESCRIPTION
  set gas price for transactions
```

_See code: [src/commands/gas.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/gas.ts)_

## `airswap help [COMMANDS]`

Display help for airswap.

```
USAGE
  $ airswap help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for airswap.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_

## `airswap ip`

display local network addresses

```
USAGE
  $ airswap ip

DESCRIPTION
  display local network addresses
```

_See code: [src/commands/ip.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/ip.ts)_

## `airswap metadata:add`

add token to local metadata

```
USAGE
  $ airswap metadata:add

DESCRIPTION
  add token to local metadata
```

_See code: [src/commands/metadata/add.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/metadata/add.ts)_

## `airswap metadata:delete`

delete token from local metadata

```
USAGE
  $ airswap metadata:delete

DESCRIPTION
  delete token from local metadata
```

_See code: [src/commands/metadata/delete.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/metadata/delete.ts)_

## `airswap metadata:lookup`

lookup token in local metadata

```
USAGE
  $ airswap metadata:lookup

DESCRIPTION
  lookup token in local metadata
```

_See code: [src/commands/metadata/lookup.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/metadata/lookup.ts)_

## `airswap metadata:update`

update local metadata from remote sources

```
USAGE
  $ airswap metadata:update

DESCRIPTION
  update local metadata from remote sources
```

_See code: [src/commands/metadata/update.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/metadata/update.ts)_

## `airswap registry:add`

add supported tokens to the registry

```
USAGE
  $ airswap registry:add

DESCRIPTION
  add supported tokens to the registry
```

_See code: [src/commands/registry/add.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/registry/add.ts)_

## `airswap registry:enable`

enable staking on the registry

```
USAGE
  $ airswap registry:enable

DESCRIPTION
  enable staking on the registry
```

_See code: [src/commands/registry/enable.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/registry/enable.ts)_

## `airswap registry:get`

get urls from the registry

```
USAGE
  $ airswap registry:get

DESCRIPTION
  get urls from the registry
```

_See code: [src/commands/registry/get.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/registry/get.ts)_

## `airswap registry:list`

list supported tokens from registry

```
USAGE
  $ airswap registry:list

DESCRIPTION
  list supported tokens from registry
```

_See code: [src/commands/registry/list.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/registry/list.ts)_

## `airswap registry:remove`

remove supported tokens from the registry

```
USAGE
  $ airswap registry:remove

DESCRIPTION
  remove supported tokens from the registry
```

_See code: [src/commands/registry/remove.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/registry/remove.ts)_

## `airswap registry:url`

set server url on the registry

```
USAGE
  $ airswap registry:url

DESCRIPTION
  set server url on the registry
```

_See code: [src/commands/registry/url.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/registry/url.ts)_

## `airswap rfq:best`

get the best available order

```
USAGE
  $ airswap rfq:best

DESCRIPTION
  get the best available order
```

_See code: [src/commands/rfq/best.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/rfq/best.ts)_

## `airswap rfq:get`

get an order from a peer

```
USAGE
  $ airswap rfq:get

DESCRIPTION
  get an order from a peer
```

_See code: [src/commands/rfq/get.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/rfq/get.ts)_

## `airswap stream:open`

stream quotes for a swap

```
USAGE
  $ airswap stream:open

DESCRIPTION
  stream quotes for a swap
```

_See code: [src/commands/stream/open.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/stream/open.ts)_

## `airswap token:approve`

approve a token for trading

```
USAGE
  $ airswap token:approve

DESCRIPTION
  approve a token for trading
```

_See code: [src/commands/token/approve.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/token/approve.ts)_

## `airswap token:revoke`

revoke a token approval

```
USAGE
  $ airswap token:revoke

DESCRIPTION
  revoke a token approval
```

_See code: [src/commands/token/revoke.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/token/revoke.ts)_

## `airswap token:transfer`

transfer tokens to another account

```
USAGE
  $ airswap token:transfer

DESCRIPTION
  transfer tokens to another account
```

_See code: [src/commands/token/transfer.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/token/transfer.ts)_

## `airswap wrapped:deposit`

deposit eth to weth

```
USAGE
  $ airswap wrapped:deposit

DESCRIPTION
  deposit eth to weth
```

_See code: [src/commands/wrapped/deposit.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/wrapped/deposit.ts)_

## `airswap wrapped:withdraw`

withdraw eth from weth

```
USAGE
  $ airswap wrapped:withdraw

DESCRIPTION
  withdraw eth from weth
```

_See code: [src/commands/wrapped/withdraw.ts](https://github.com/airswap/airswap-cli/blob/v4.0.6/src/commands/wrapped/withdraw.ts)_
<!-- commandsstop -->
