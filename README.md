airswap-maker-kit
=================

Tools for Makers on the AirSwap Network

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/airswap-maker-kit.svg)](https://npmjs.org/package/airswap-maker-kit)
[![Downloads/week](https://img.shields.io/npm/dw/airswap-maker-kit.svg)](https://npmjs.org/package/airswap-maker-kit)
[![License](https://img.shields.io/npm/l/airswap-maker-kit.svg)](https://github.com/airswap/airswap-maker-kit/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g airswap
$ airswap COMMAND
running command...
$ airswap (-v|--version|version)
airswap/1.0.0-beta darwin-x64 node-v10.13.0
$ airswap --help [COMMAND]
USAGE
  $ airswap COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`airswap account:generate`](#airswap-accountgenerate)
* [`airswap account:set`](#airswap-accountset)
* [`airswap account:show`](#airswap-accountshow)
* [`airswap account:unset`](#airswap-accountunset)
* [`airswap balances`](#airswap-balances)
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

## `airswap account:generate`

generate a new account

```
USAGE
  $ airswap account:generate
```

_See code: [src/commands/account/generate.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/account/generate.ts)_

## `airswap account:set`

set the current account

```
USAGE
  $ airswap account:set
```

_See code: [src/commands/account/set.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/account/set.ts)_

## `airswap account:show`

show the current account

```
USAGE
  $ airswap account:show
```

_See code: [src/commands/account/show.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/account/show.ts)_

## `airswap account:unset`

unset the current account

```
USAGE
  $ airswap account:unset
```

_See code: [src/commands/account/unset.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/account/unset.ts)_

## `airswap balances`

display token balances

```
USAGE
  $ airswap balances
```

_See code: [src/commands/balances.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/balances.ts)_

## `airswap intent:enable`

enable staking on the indexer

```
USAGE
  $ airswap intent:enable
```

_See code: [src/commands/intent/enable.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/intent/enable.ts)_

## `airswap intent:get`

get intents from the indexer

```
USAGE
  $ airswap intent:get
```

_See code: [src/commands/intent/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/intent/get.ts)_

## `airswap intent:new`

create an index for a new token pair

```
USAGE
  $ airswap intent:new
```

_See code: [src/commands/intent/new.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/intent/new.ts)_

## `airswap intent:set`

set an intent

```
USAGE
  $ airswap intent:set
```

_See code: [src/commands/intent/set.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/intent/set.ts)_

## `airswap intent:unset`

unset an intent

```
USAGE
  $ airswap intent:unset
```

_See code: [src/commands/intent/unset.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/intent/unset.ts)_

## `airswap ip`

display local network addresses

```
USAGE
  $ airswap ip
```

_See code: [src/commands/ip.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/ip.ts)_

## `airswap network`

set the active network

```
USAGE
  $ airswap network
```

_See code: [src/commands/network.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/network.ts)_

## `airswap orders:best`

get the best available order

```
USAGE
  $ airswap orders:best
```

_See code: [src/commands/orders/best.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/orders/best.ts)_

## `airswap orders:get`

get an order from a peer

```
USAGE
  $ airswap orders:get
```

_See code: [src/commands/orders/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/orders/get.ts)_

## `airswap quotes:best`

get the best available quote

```
USAGE
  $ airswap quotes:best
```

_See code: [src/commands/quotes/best.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/quotes/best.ts)_

## `airswap quotes:get`

get a quote from a peer

```
USAGE
  $ airswap quotes:get
```

_See code: [src/commands/quotes/get.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/quotes/get.ts)_

## `airswap tokens:approve`

approve a token for trading

```
USAGE
  $ airswap tokens:approve
```

_See code: [src/commands/tokens/approve.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/tokens/approve.ts)_

## `airswap tokens:update`

update local metadata

```
USAGE
  $ airswap tokens:update
```

_See code: [src/commands/tokens/update.ts](https://github.com/airswap/airswap-maker-kit/blob/v1.0.0-beta/src/commands/tokens/update.ts)_
<!-- commandsstop -->
