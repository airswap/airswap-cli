import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as jayson from 'jayson'
import { ethers } from 'ethers'

import * as emoji from 'node-emoji'

import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'
import { orders } from '@airswap/order-utils'
import BigNumber from 'bignumber.js'
import { table } from 'table'

const constants = require('./constants.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export async function promptSide() {
  let side = (await cli.prompt('buy or sell')).toUpperCase()
  if (side.indexOf('B') === 0) {
    side = 'B'
  }
  if (side.indexOf('S') === 0) {
    side = 'S'
  }
  if (side !== 'B' && side !== 'S') {
    process.exit(0)
  }
  return side
}

export async function promptToken(metadata: any, signerTokenLabel?: string, senderTokenLabel?: string) {
  const first = (await cli.prompt(signerTokenLabel || 'signerToken')).toUpperCase()
  if (!(first in metadata.bySymbol)) {
    throw new Error(`Token ${first} not found in metadata`)
  }
  return metadata.bySymbol[first]
}

export async function promptTokens(metadata: any, signerTokenLabel?: string, senderTokenLabel?: string) {
  const first = (await cli.prompt(signerTokenLabel || 'signerToken')).toUpperCase()
  if (!(first in metadata.bySymbol)) {
    throw new Error(`Token ${first} not found in metadata`)
  }
  const second = (await cli.prompt(senderTokenLabel || 'senderToken')).toUpperCase()
  if (!(second in metadata.bySymbol)) {
    throw new Error(`Token ${second} not found in metadata`)
  }
  return {
    first: metadata.bySymbol[first],
    second: metadata.bySymbol[second],
  }
}

export async function printOrder(
  ctx: any,
  side: string,
  signerToken: any,
  senderToken: any,
  locator: string,
  order: any,
) {
  const signerAmountDecimal = new BigNumber(order.signer.amount)
    .dividedBy(new BigNumber(10).pow(signerToken.decimals))
    .toFixed()

  const senderAmountDecimal = new BigNumber(order.sender.amount)
    .dividedBy(new BigNumber(10).pow(senderToken.decimals))
    .toFixed()

  ctx.log(chalk.underline.bold(`Response: ${locator}`))
  ctx.log()

  if (side === 'B') {
    ctx.log(
      emoji.get('sparkles'),
      chalk.bold('Buy'),
      chalk.bold(signerAmountDecimal),
      signerToken.name,
      'for',
      chalk.bold(senderAmountDecimal),
      senderToken.name,
    )
    ctx.log(
      chalk.gray(
        `Price ${chalk.white(
          new BigNumber(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${signerToken.name}/${senderToken.name} (${chalk.white(
          new BigNumber(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${senderToken.name}/${signerToken.name})`,
      ),
    )
  } else {
    ctx.log(
      emoji.get('sparkles'),
      chalk.bold('Sell'),
      chalk.bold(senderAmountDecimal),
      senderToken.name,
      'for',
      chalk.bold(signerAmountDecimal),
      signerToken.name,
    )
    ctx.log(
      chalk.gray(
        `Price ${chalk.white(
          new BigNumber(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${senderToken.name}/${signerToken.name} (${chalk.white(
          new BigNumber(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${signerToken.name}/${senderToken.name})`,
      ),
    )
  }
}

export async function printObject(ctx: any, title: string, params: any) {
  const data = [[chalk.bold('Param'), chalk.bold('Value')]]
  for (let key in params) {
    data.push([key, params[key]])
  }
  const config = {
    columns: {
      0: {
        alignment: 'left',
        width: 15,
      },
      1: {
        alignment: 'left',
        width: 60,
      },
    },
  }

  printTable(ctx, title, data, config)
}

export function printTable(ctx: any, title: string, data: Array, config: object) {
  ctx.log(chalk.underline.bold(title))
  ctx.log()
  ctx.log(table(data, config))
}

export async function confirmTransaction(ctx: any, name: String, params: any, callback: Function) {
  const data = [[chalk.bold('Param'), chalk.bold('Value')]]
  for (let key in params) {
    data.push([key, params[key]])
  }
  const config = {
    columns: {
      0: {
        alignment: 'left',
        width: 15,
      },
      1: {
        alignment: 'left',
        width: 60,
      },
    },
  }

  printTable(ctx, `Transaction: ${name}`, data, config)
  if (await cli.confirm('Type "yes" to send')) {
    callback()
  }
}

export async function updateMetadata(ctx: any) {
  const metadataRinkeby = path.join(ctx.config.configDir, 'metadata-rinkeby.json')

  cli.action.start('Updating metadata')

  await fs.outputJson(metadataRinkeby, {
    bySymbol: {
      DAI: {
        addr: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
        name: 'DAI',
        decimals: 18,
      },
      WETH: {
        addr: '0xc778417e063141139fce010982780140aa0cd5ab',
        name: 'WETH',
        decimals: 18,
      },
      AST: {
        addr: '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8',
        name: 'AST',
        decimals: 4,
      },
    },
    byAddress: {
      '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': {
        addr: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
        name: 'DAI',
        decimals: 18,
      },
      '0xc778417e063141139fce010982780140aa0cd5ab': {
        addr: '0xc778417e063141139fce010982780140aa0cd5ab',
        name: 'WETH',
        decimals: 18,
      },
      '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8': {
        addr: '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8',
        name: 'AST',
        decimals: 4,
      },
    },
  })
  ctx.log(`Rinkeby: ${metadataRinkeby}`)

  const metadataMainnet = path.join(ctx.config.configDir, 'metadata-mainnet.json')

  axios('https://forkdelta.app/config/main.json')
    .then(async ({ data }: any) => {
      data.tokens.push({
        addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        fullName: 'Wrapped Ether',
        decimals: 18,
        name: 'WETH',
      })

      const byAddress = {}
      const bySymbol = {}
      for (let i in data.tokens) {
        bySymbol[data.tokens[i].name] = data.tokens[i]
        byAddress[data.tokens[i].addr] = data.tokens[i]
      }

      await fs.outputJson(metadataMainnet, {
        bySymbol,
        byAddress,
      })

      ctx.log(`Mainnet: ${metadataMainnet}`)
      cli.action.stop()
      ctx.log()
    })
    .catch((error: any) => console.log(error))
}

export function handleTransaction(tx: any) {
  console.log(chalk.underline(`https://${constants.etherscanDomains[tx.chainId]}/tx/${tx.hash}\n`))
  cli.action.start(`Mining transaction (${constants.chainNames[tx.chainId]})`)
  tx.wait(constants.DEFAULT_CONFIRMATIONS).then(() => {
    cli.action.stop()
    console.log(
      `${emoji.get('white_check_mark')} Transaction complete (${constants.DEFAULT_CONFIRMATIONS} confirmations)\n\n`,
    )
    process.exit()
  })
}

export function handleError(error: any) {
  console.log(`\n${chalk.yellow('Error')}: ${error.reason || error.responseText || error}`)
  console.log('Please check your input values.\n')
}

export function indexerCall(wallet: any, signerToken: string, senderToken: string, callback: Function) {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    .getLocators(
      signerToken,
      senderToken,
      constants.protocols.HTTP_LATEST,
      constants.INDEX_HEAD,
      constants.MAX_LOCATORS,
    )
    .then(callback)
}

export function peerCall(locator: string, method: string, params: any, callback: Function) {
  let client
  if (locator.includes('https')) {
    client = jayson.client.https(locator)
  } else {
    client = jayson.client.http(locator)
  }

  setTimeout(() => {
    callback('timeout')
    callback = () => {}
  }, 5000)

  client.request(method, params, function(err: any, error: any, result: any) {
    if (err) {
      callback(`\n${chalk.yellow('Connection Error')}: ${locator} \n ${err}`)
    } else {
      if (error) {
        callback(`\n${chalk.yellow('Maker Error')}: ${error.message}\n`)
      } else {
        callback(null, result)
      }
    }
    callback = () => {}
  })
}

export function multiPeerCall(wallet: any, method: string, params: any, callback: Function) {
  indexerCall(wallet, params.signerToken, params.senderToken, (result: any) => {
    const locators = result.locators

    let requested = 0
    let completed = 0
    let results: any[] = []
    let errors: any[] = []

    cli.action.start(`Requesting from ${locators.length} peer${locators.length !== 1 ? 's' : ''}`)

    for (let i = 0; i < locators.length; i++) {
      try {
        locators[i] = ethers.utils.parseBytes32String(locators[i])
      } catch (e) {
        locators[i] = false
      }
      if (locators[i]) {
        requested++

        peerCall(locators[i], method, params, (err: any, order: any) => {
          if (err) {
            errors.push({ locator: locators[i], message: err })
          } else {
            if (method.indexOf('Order') !== -1) {
              if (orders.isValidOrder(order)) {
                results.push({
                  locator: locators[i],
                  order,
                })
              } else {
                errors.push({ locator: locators[i], message: 'Got an invalid order or signature ' })
              }
            } else {
              results.push({
                locator: locators[i],
                order,
              })
            }
          }
          if (++completed === requested) {
            cli.action.stop()

            if (!results.length) {
              callback(null, null, errors)
            } else {
              let lowest = results[0]

              for (var j = 1; j < results.length; j++) {
                if (new BigNumber(results[j].order.sender.amount).lt(lowest.order.sender.amount)) {
                  lowest = results[j]
                }
              }
              callback(lowest.order, lowest.locator, errors)
            }
          }
        })
      }
    }
  })
}

export async function getRequest(wallet: any, metadata: any, kind: string) {
  const side = await promptSide()
  const amount = await cli.prompt('amount')

  if (isNaN(parseInt(amount))) {
    process.exit(0)
  }

  const { first, second } = await promptTokens(metadata, 'of', 'for')

  let signerToken
  let senderToken

  if (side === 'B') {
    signerToken = first
    senderToken = second
  } else {
    signerToken = second
    senderToken = first
  }

  let method = 'getSenderSide' + kind
  let params = {
    signerToken: signerToken.addr,
    senderToken: senderToken.addr,
  }

  if (kind === 'Order') {
    Object.assign(params, {
      senderWallet: wallet.address,
    })
  }

  if (side === 'B') {
    const signerAmountAtomic = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(first.decimals))
    Object.assign(params, {
      signerAmount: signerAmountAtomic.integerValue(BigNumber.ROUND_FLOOR).toFixed(),
    })
  } else {
    const senderAmountAtomic = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(first.decimals))
    method = 'getSignerSide' + kind
    Object.assign(params, {
      senderAmount: senderAmountAtomic.integerValue(BigNumber.ROUND_FLOOR).toFixed(),
    })
  }

  return {
    side,
    signerToken,
    senderToken,
    method,
    params,
  }
}

export async function getBest(ctx: any, kind: string, metadata: any, wallet: any, callback: Function) {
  const request = await getRequest(wallet, metadata, kind)

  ctx.log()
  printObject(ctx, `Request: ${request.method}`, request.params)

  multiPeerCall(wallet, request.method, request.params, (order: any, locator: string, errors: Array<any>) => {
    ctx.log()

    /* TODO: Verbose Flag
    if (errors.length) {
      ctx.log(chalk.bold('Errors'))
      for (var i = 0; i < errors.length; i++) {
        ctx.log(`${errors[i].locator}: ${errors[i].message}`)
      }
      ctx.log()
    }
    */

    if (!order) {
      ctx.log(chalk.yellow('\nNo valid results found.\n'))
      process.exit(0)
    } else {
      printOrder(ctx, request.side, request.signerToken, request.senderToken, locator, order)
      callback(request, order)
    }
  })
}
