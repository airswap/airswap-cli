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

Set the active chain

```
$ airswap chain
```

# All Commands

<!-- commands -->
* [`airswap account:delete`](#airswap-accountdelete)
* [`airswap account:export`](#airswap-accountexport)
* [`airswap account:generate`](#airswap-accountgenerate)
* [`airswap account:import`](#airswap-accountimport)
* [`airswap approve`](#airswap-approve)
* [`airswap balances`](#airswap-balances)
* [`airswap best`](#airswap-best)
* [`airswap chain`](#airswap-chain)
* [`airswap delegate:authorize`](#airswap-delegateauthorize)
* [`airswap delegate:revoke`](#airswap-delegaterevoke)
* [`airswap delegate:setRule`](#airswap-delegatesetrule)
* [`airswap delegate:swap`](#airswap-delegateswap)
* [`airswap delegate:unsetRule`](#airswap-delegateunsetrule)
* [`airswap gas`](#airswap-gas)
* [`airswap help [COMMANDS]`](#airswap-help-commands)
* [`airswap inspect`](#airswap-inspect)
* [`airswap ip`](#airswap-ip)
* [`airswap metadata:add`](#airswap-metadataadd)
* [`airswap metadata:delete`](#airswap-metadatadelete)
* [`airswap metadata:lookup`](#airswap-metadatalookup)
* [`airswap metadata:update`](#airswap-metadataupdate)
* [`airswap order`](#airswap-order)
* [`airswap protocols:add`](#airswap-protocolsadd)
* [`airswap protocols:list`](#airswap-protocolslist)
* [`airswap protocols:remove`](#airswap-protocolsremove)
* [`airswap registry:approve`](#airswap-registryapprove)
* [`airswap registry:eject`](#airswap-registryeject)
* [`airswap registry:list`](#airswap-registrylist)
* [`airswap registry:revoke`](#airswap-registryrevoke)
* [`airswap registry:status`](#airswap-registrystatus)
* [`airswap registry:url`](#airswap-registryurl)
* [`airswap revoke`](#airswap-revoke)
* [`airswap stream`](#airswap-stream)
* [`airswap tokens:add`](#airswap-tokensadd)
* [`airswap tokens:list`](#airswap-tokenslist)
* [`airswap tokens:remove`](#airswap-tokensremove)
* [`airswap transfer`](#airswap-transfer)
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

_See code: [src/commands/account/delete.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/account/delete.ts)_

## `airswap account:export`

export the current ethereum account

```
USAGE
  $ airswap account:export

DESCRIPTION
  export the current ethereum account
```

_See code: [src/commands/account/export.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/account/export.ts)_

## `airswap account:generate`

generate a new ethereum account

```
USAGE
  $ airswap account:generate

DESCRIPTION
  generate a new ethereum account
```

_See code: [src/commands/account/generate.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/account/generate.ts)_

## `airswap account:import`

import an ethereum account

```
USAGE
  $ airswap account:import

DESCRIPTION
  import an ethereum account
```

_See code: [src/commands/account/import.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/account/import.ts)_

## `airswap approve`

approve a token for trading

```
USAGE
  $ airswap approve

DESCRIPTION
  approve a token for trading
```

_See code: [src/commands/approve.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/approve.ts)_

## `airswap balances`

display token balances

```
USAGE
  $ airswap balances

DESCRIPTION
  display token balances
```

_See code: [src/commands/balances.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/balances.ts)_

## `airswap best`

compare order pricing from servers

```
USAGE
  $ airswap best

DESCRIPTION
  compare order pricing from servers
```

_See code: [src/commands/best.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/best.ts)_

## `airswap chain`

set the active chain

```
USAGE
  $ airswap chain

DESCRIPTION
  set the active chain
```

_See code: [src/commands/chain.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/chain.ts)_

## `airswap delegate:authorize`

set a delegate rule

```
USAGE
  $ airswap delegate:authorize

DESCRIPTION
  set a delegate rule
```

_See code: [src/commands/delegate/authorize.ts](https://github.com/airswap/airswap-cli/blob/v4.3.1/src/commands/delegate/authorize.ts)_

## `airswap delegate:revoke`

set a delegate rule

```
USAGE
  $ airswap delegate:revoke

DESCRIPTION
  set a delegate rule
```

_See code: [src/commands/delegate/revoke.ts](https://github.com/airswap/airswap-cli/blob/v4.3.1/src/commands/delegate/revoke.ts)_

## `airswap delegate:setRule`

set a delegate rule

```
USAGE
  $ airswap delegate:setRule

DESCRIPTION
  set a delegate rule
```

_See code: [src/commands/delegate/setRule.ts](https://github.com/airswap/airswap-cli/blob/v4.3.1/src/commands/delegate/setRule.ts)_

## `airswap delegate:swap`

set a delegate rule

```
USAGE
  $ airswap delegate:swap

DESCRIPTION
  set a delegate rule
```

_See code: [src/commands/delegate/swap.ts](https://github.com/airswap/airswap-cli/blob/v4.3.1/src/commands/delegate/swap.ts)_

## `airswap delegate:unsetRule`

unset a delegate rule

```
USAGE
  $ airswap delegate:unsetRule

DESCRIPTION
  unset a delegate rule
```

_See code: [src/commands/delegate/unsetRule.ts](https://github.com/airswap/airswap-cli/blob/v4.3.1/src/commands/delegate/unsetRule.ts)_

## `airswap gas`

set gas price for transactions

```
USAGE
  $ airswap gas

DESCRIPTION
  set gas price for transactions
```

_See code: [src/commands/gas.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/gas.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/src/commands/help.ts)_

## `airswap inspect`

inspect protocols for a server

```
USAGE
  $ airswap inspect

DESCRIPTION
  inspect protocols for a server
```

_See code: [src/commands/inspect.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/inspect.ts)_

## `airswap ip`

display local network addresses

```
USAGE
  $ airswap ip

DESCRIPTION
  display local network addresses
```

_See code: [src/commands/ip.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/ip.ts)_

## `airswap metadata:add`

add token to local metadata

```
USAGE
  $ airswap metadata:add

DESCRIPTION
  add token to local metadata
```

_See code: [src/commands/metadata/add.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/metadata/add.ts)_

## `airswap metadata:delete`

delete token from local metadata

```
USAGE
  $ airswap metadata:delete

DESCRIPTION
  delete token from local metadata
```

_See code: [src/commands/metadata/delete.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/metadata/delete.ts)_

## `airswap metadata:lookup`

lookup token in local metadata

```
USAGE
  $ airswap metadata:lookup

DESCRIPTION
  lookup token in local metadata
```

_See code: [src/commands/metadata/lookup.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/metadata/lookup.ts)_

## `airswap metadata:update`

update local metadata from remote sources

```
USAGE
  $ airswap metadata:update

DESCRIPTION
  update local metadata from remote sources
```

_See code: [src/commands/metadata/update.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/metadata/update.ts)_

## `airswap order`

get an order from a server

```
USAGE
  $ airswap order

DESCRIPTION
  get an order from a server
```

_See code: [src/commands/order.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/order.ts)_

## `airswap protocols:add`

add supported protocols to the registry

```
USAGE
  $ airswap protocols:add

DESCRIPTION
  add supported protocols to the registry
```

_See code: [src/commands/protocols/add.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/protocols/add.ts)_

## `airswap protocols:list`

list activated protocols

```
USAGE
  $ airswap protocols:list

DESCRIPTION
  list activated protocols
```

_See code: [src/commands/protocols/list.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/protocols/list.ts)_

## `airswap protocols:remove`

remove supported protocols from the registry

```
USAGE
  $ airswap protocols:remove

DESCRIPTION
  remove supported protocols from the registry
```

_See code: [src/commands/protocols/remove.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/protocols/remove.ts)_

## `airswap registry:approve`

enable staking on the registry

```
USAGE
  $ airswap registry:approve

DESCRIPTION
  enable staking on the registry
```

_See code: [src/commands/registry/approve.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/registry/approve.ts)_

## `airswap registry:eject`

remove url, protocols, and tokens from registry

```
USAGE
  $ airswap registry:eject

DESCRIPTION
  remove url, protocols, and tokens from registry
```

_See code: [src/commands/registry/eject.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/registry/eject.ts)_

## `airswap registry:list`

get urls from the registry

```
USAGE
  $ airswap registry:list

DESCRIPTION
  get urls from the registry
```

_See code: [src/commands/registry/list.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/registry/list.ts)_

## `airswap registry:revoke`

disable staking on the registry

```
USAGE
  $ airswap registry:revoke

DESCRIPTION
  disable staking on the registry
```

_See code: [src/commands/registry/revoke.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/registry/revoke.ts)_

## `airswap registry:status`

check status of url, protocols, and tokens on registry

```
USAGE
  $ airswap registry:status

DESCRIPTION
  check status of url, protocols, and tokens on registry
```

_See code: [src/commands/registry/status.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/registry/status.ts)_

## `airswap registry:url`

set server url on the registry

```
USAGE
  $ airswap registry:url

DESCRIPTION
  set server url on the registry
```

_See code: [src/commands/registry/url.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/registry/url.ts)_

## `airswap revoke`

revoke a token approval

```
USAGE
  $ airswap revoke

DESCRIPTION
  revoke a token approval
```

_See code: [src/commands/revoke.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/revoke.ts)_

## `airswap stream`

stream quotes for a swap

```
USAGE
  $ airswap stream

DESCRIPTION
  stream quotes for a swap
```

_See code: [src/commands/stream.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/stream.ts)_

## `airswap tokens:add`

add supported tokens to the registry

```
USAGE
  $ airswap tokens:add

DESCRIPTION
  add supported tokens to the registry
```

_See code: [src/commands/tokens/add.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/tokens/add.ts)_

## `airswap tokens:list`

list activated tokens

```
USAGE
  $ airswap tokens:list

DESCRIPTION
  list activated tokens
```

_See code: [src/commands/tokens/list.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/tokens/list.ts)_

## `airswap tokens:remove`

remove supported tokens from the registry

```
USAGE
  $ airswap tokens:remove

DESCRIPTION
  remove supported tokens from the registry
```

_See code: [src/commands/tokens/remove.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/tokens/remove.ts)_

## `airswap transfer`

transfer tokens to another account

```
USAGE
  $ airswap transfer

DESCRIPTION
  transfer tokens to another account
```

_See code: [src/commands/transfer.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/transfer.ts)_

## `airswap wrapped:deposit`

deposit eth to weth

```
USAGE
  $ airswap wrapped:deposit

DESCRIPTION
  deposit eth to weth
```

_See code: [src/commands/wrapped/deposit.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/wrapped/deposit.ts)_

## `airswap wrapped:withdraw`

withdraw eth from weth

```
USAGE
  $ airswap wrapped:withdraw

DESCRIPTION
  withdraw eth from weth
```

_See code: [src/commands/wrapped/withdraw.ts](https://github.com/airswap/airswap-cli/blob/v5.0.2/src/commands/wrapped/withdraw.ts)_
<!-- commandsstop -->
