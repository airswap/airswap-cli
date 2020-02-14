import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as jayson from 'jayson'
import { ethers } from 'ethers'
import * as url from 'url'
import { orders } from '@airswap/order-utils'
import * as utils from './utils'
import BigNumber from 'bignumber.js'
import { get, getTokens } from './prompt'

const constants = require('./constants.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export function indexerCall(
  wallet: any,
  signerToken: string,
  senderToken: string,
  protocol: string,
  callback: Function,
) {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    .getLocators(signerToken, senderToken, protocol, constants.INDEX_HEAD, constants.MAX_LOCATORS)
    .then(callback)
}

export function peerCall(locator: string, method: string, params: any, callback: Function) {
  let client

  if (!/^http:\/\//.test(locator) && !/^https:\/\//.test(locator)) {
    locator = `https://${locator}`
  }

  const locatorUrl = url.parse(locator)
  const options = {
    protocol: locatorUrl.protocol,
    hostname: locatorUrl.hostname,
    port: locatorUrl.port,
    timeout: constants.REQUEST_TIMEOUT,
  }

  if (options.protocol === 'http:') {
    client = jayson.Client.http(options)
  } else if (options.protocol === 'https:') {
    client = jayson.Client.https(options)
  }

  client.request(method, params, function(err: any, error: any, result: any) {
    if (err) {
      callback(`\n${chalk.yellow('Server Error')}: ${locator} \n ${err}`, null)
    } else if (error) {
      callback(`\n${chalk.yellow('Maker Error')}: ${error.message}\n`, null)
    } else if (result) {
      callback(null, result)
    } else {
      callback(null, null)
    }
  })
}

export function multiPeerCall(wallet: any, method: string, params: any, protocol: string, callback: Function) {
  indexerCall(wallet, params.signerToken, params.senderToken, protocol, (result: any) => {
    const locators = result.locators

    if (!locators.length) {
      callback()
      return
    }

    let requested = 0
    let completed = 0
    const results: any[] = []
    const errors: any[] = []

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
              if (method.indexOf('Signer') !== -1) {
                const { best, locator } = utils.getByHighestSignerAmount(results)
                callback(best, locator, results, errors)
              } else {
                const { best, locator } = utils.getByLowestSenderAmount(results)
                callback(best, locator, results, errors)
              }
            }
          }
        })
      }
    }
  })
}

export async function getRequest(wallet: any, metadata: any, kind: string) {
  const { side, amount }: any = await get({
    side: {
      description: 'buy or sell',
      type: 'Side',
    },
    amount: {
      type: 'Number',
    },
  })

  const { first, second }: any = await getTokens({ first: 'of', second: 'for' }, metadata)

  let signerToken
  let senderToken

  if (side === 'buy') {
    signerToken = first
    senderToken = second
  } else {
    signerToken = second
    senderToken = first
  }

  let method = 'getSenderSide' + kind
  const params = {
    signerToken: signerToken.addr,
    senderToken: senderToken.addr,
  }

  if (kind === 'Order') {
    Object.assign(params, {
      senderWallet: wallet.address,
    })
  }

  if (side === 'buy') {
    const signerAmountAtomic = utils.getAtomicValue(amount, first.addr, metadata)
    Object.assign(params, {
      signerAmount: signerAmountAtomic.integerValue(BigNumber.ROUND_FLOOR).toFixed(),
    })
  } else {
    const senderAmountAtomic = utils.getAtomicValue(amount, first.addr, metadata)
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
