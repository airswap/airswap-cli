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
$ npm install -g airswap-maker-kit
$ airswap COMMAND
running command...
$ airswap (-v|--version|version)
airswap-maker-kit/0.0.0 darwin-x64 node-v10.13.0
$ airswap --help [COMMAND]
USAGE
  $ airswap COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`airswap hello [FILE]`](#airswap-hello-file)
* [`airswap help [COMMAND]`](#airswap-help-command)

## `airswap hello [FILE]`

describe the command here

```
USAGE
  $ airswap hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ airswap hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/airswap/airswap-maker-kit/blob/v0.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
