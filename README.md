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

Set the active chain ([chainIds](https://github.com/airswap/airswap-protocols/blob/8ddcacf9ab7b9b5778e5003c56564e7ae55afc9c/tools/constants/index.ts#L28))

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
* [`airswap gas`](#airswap-gas)
* [`airswap help [COMMAND]`](#airswap-help-command)
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
delete the current ethereum account

USAGE
  $ airswap account:delete
```

_See code: [src/commands/account/delete.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/account/delete.ts)_

## `airswap account:export`

export the current ethereum account

```
export the current ethereum account

USAGE
  $ airswap account:export
```

_See code: [src/commands/account/export.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/account/export.ts)_

## `airswap account:generate`

generate a new ethereum account

```
generate a new ethereum account

USAGE
  $ airswap account:generate
```

_See code: [src/commands/account/generate.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/account/generate.ts)_

## `airswap account:import`

import an ethereum account

```
import an ethereum account

USAGE
  $ airswap account:import
```

_See code: [src/commands/account/import.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/account/import.ts)_

## `airswap balances`

display token balances

```
display token balances

USAGE
  $ airswap balances
```

_See code: [src/commands/balances.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/balances.ts)_

## `airswap chain`

set the active ethereum chain

```
set the active ethereum chain

USAGE
  $ airswap chain
```

_See code: [src/commands/chain.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/chain.ts)_

## `airswap gas`

set gas price for transactions

```
set gas price for transactions

USAGE
  $ airswap gas
```

_See code: [src/commands/gas.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/gas.ts)_

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

## `airswap ip`

display local network addresses

```
display local network addresses

USAGE
  $ airswap ip
```

_See code: [src/commands/ip.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/ip.ts)_

## `airswap metadata:add`

add token to local metadata

```
add token to local metadata

USAGE
  $ airswap metadata:add
```

_See code: [src/commands/metadata/add.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/metadata/add.ts)_

## `airswap metadata:delete`

delete token from local metadata

```
delete token from local metadata

USAGE
  $ airswap metadata:delete
```

_See code: [src/commands/metadata/delete.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/metadata/delete.ts)_

## `airswap metadata:lookup`

lookup token in local metadata

```
lookup token in local metadata

USAGE
  $ airswap metadata:lookup
```

_See code: [src/commands/metadata/lookup.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/metadata/lookup.ts)_

## `airswap metadata:update`

update local metadata from remote sources

```
update local metadata from remote sources

USAGE
  $ airswap metadata:update
```

_See code: [src/commands/metadata/update.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/metadata/update.ts)_

## `airswap registry:add`

add supported tokens to the registry

```
add supported tokens to the registry

USAGE
  $ airswap registry:add
```

_See code: [src/commands/registry/add.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/registry/add.ts)_

## `airswap registry:enable`

enable staking on the registry

```
enable staking on the registry

USAGE
  $ airswap registry:enable
```

_See code: [src/commands/registry/enable.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/registry/enable.ts)_

## `airswap registry:get`

get urls from the registry

```
get urls from the registry

USAGE
  $ airswap registry:get
```

_See code: [src/commands/registry/get.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/registry/get.ts)_

## `airswap registry:list`

list supported tokens from registry

```
list supported tokens from registry

USAGE
  $ airswap registry:list
```

_See code: [src/commands/registry/list.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/registry/list.ts)_

## `airswap registry:remove`

remove supported tokens from the registry

```
remove supported tokens from the registry

USAGE
  $ airswap registry:remove
```

_See code: [src/commands/registry/remove.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/registry/remove.ts)_

## `airswap registry:url`

set server url on the registry

```
set server url on the registry

USAGE
  $ airswap registry:url
```

_See code: [src/commands/registry/url.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/registry/url.ts)_

## `airswap rfq:best`

get the best available order

```
get the best available order

USAGE
  $ airswap rfq:best
```

_See code: [src/commands/rfq/best.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/rfq/best.ts)_

## `airswap rfq:get`

get an order from a peer

```
get an order from a peer

USAGE
  $ airswap rfq:get
```

_See code: [src/commands/rfq/get.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/rfq/get.ts)_

## `airswap stream:open`

stream quotes for a swap

```
stream quotes for a swap

USAGE
  $ airswap stream:open
```

_See code: [src/commands/stream/open.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/stream/open.ts)_

## `airswap token:approve`

approve a token for trading

```
approve a token for trading

USAGE
  $ airswap token:approve
```

_See code: [src/commands/token/approve.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/token/approve.ts)_

## `airswap token:revoke`

revoke a token approval

```
revoke a token approval

USAGE
  $ airswap token:revoke
```

_See code: [src/commands/token/revoke.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/token/revoke.ts)_

## `airswap token:transfer`

transfer tokens to another account

```
transfer tokens to another account

USAGE
  $ airswap token:transfer
```

_See code: [src/commands/token/transfer.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/token/transfer.ts)_

## `airswap wrapped:deposit`

deposit eth to weth

```
deposit eth to weth

USAGE
  $ airswap wrapped:deposit
```

_See code: [src/commands/wrapped/deposit.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/wrapped/deposit.ts)_

## `airswap wrapped:withdraw`

withdraw eth from weth

```
withdraw eth from weth

USAGE
  $ airswap wrapped:withdraw
```

_See code: [src/commands/wrapped/withdraw.ts](https://github.com/airswap/airswap-cli/blob/v3.0.2/src/commands/wrapped/withdraw.ts)_
<!-- commandsstop -->
