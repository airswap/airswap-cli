import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as jayson from 'jayson'
import { ethers } from 'ethers'
import * as url from 'url'
import {
  isValidQuote,
  isValidOrder,
  isValidLightOrder,
  getBestByLowestSenderAmount,
  getBestByHighestSignerAmount,
} from '@airswap/utils'
import * as utils from './utils'
import BigNumber from 'bignumber.js'
import { get, getTokens } from './prompt'
import { INDEX_HEAD } from '@airswap/constants'

const constants = require('./constants.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const Registry = require('@airswap/registry/build/contracts/Registry.sol/Registry.json')

const indexerDeploys = require('@airswap/indexer/deploys.json')
const registryDeploys = require('@airswap/registry/deploys.js')
const swapDeploys = require('@airswap/swap/deploys.json')
const lightDeploys = require('@airswap/light/deploys.json')

export async function getServerURLs(
  wallet: any,
  signerToken: string,
  senderToken: string,
  protocol: string,
  callback: Function,
) {
  const chainId = (await wallet.provider.getNetwork()).chainId
  const indexerAddress = indexerDeploys[chainId]
  new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    .getLocators(signerToken, senderToken, protocol, INDEX_HEAD, constants.MAX_LOCATORS)
    .then(async result => {
      const locators = [...result.locators].map(url => {
        try {
          return ethers.utils.parseBytes32String(url)
        } catch (e) {
          return false
        }
      })
      const registryAddress = registryDeploys[chainId]
      const registryContract = new ethers.Contract(registryAddress, Registry.abi, wallet)
      const signerURLs = await registryContract.getURLsForToken(signerToken)
      const senderURLs = await registryContract.getURLsForToken(senderToken)
      const urls = signerURLs.filter(value => senderURLs.includes(value))
      callback(locators.concat(urls))
    })
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
    path: locatorUrl.path,
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

export function multiPeerCall(
  wallet: any,
  method: string,
  params: any,
  protocol: string,
  callback: Function,
  lightOrder = false,
) {
  getServerURLs(wallet, params.signerToken, params.senderToken, protocol, (locators: any) => {
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
      if (locators[i]) {
        requested++
        peerCall(locators[i], method, params, (err: any, result: any) => {
          try {
            if (lightOrder) {
              results.push(validateLightResponse(err, result, method, params))
            } else {
              results.push(validateFullResponse(err, result, method, params, locators[i]))
            }
          } catch (e) {
            errors.push({ locator: locators[i], message: e })
          }

          if (++completed === requested) {
            cli.action.stop()

            if (!results.length) {
              callback(null, null, errors)
            } else {
              let best
              if (lightOrder) {
                if (method.indexOf('Signer') !== -1) {
                  best = getHighestLightSigner(results)
                } else {
                  best = getLowestLightSender(results)
                }
              } else {
                if (method.indexOf('Signer') !== -1) {
                  best = getBestByHighestSignerAmount(results)
                } else {
                  best = getBestByLowestSenderAmount(results)
                }
              }
              callback(best, results, errors)
            }
          }
        })
      }
    }
  })
}

export async function getRequest(wallet: any, metadata: any, kind: string) {
  const { format, side, amount }: any = await get({
    format: {
      description: 'full or light',
      type: 'Format',
    },
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

  const chainId = (await wallet.provider.getNetwork()).chainId
  let swapContract = swapDeploys[chainId]
  if (format === 'light') {
    swapContract = lightDeploys[chainId]
  }

  let method = 'getSenderSide' + kind
  const params = {
    signerToken: signerToken.address,
    senderToken: senderToken.address,
    swapContract,
  }

  if (kind === 'Order') {
    Object.assign(params, {
      senderWallet: wallet.address,
    })
  }

  if (side === 'buy') {
    const signerAmountAtomic = utils.getAtomicValue(amount, first.address, metadata)
    Object.assign(params, {
      signerAmount: signerAmountAtomic.integerValue(BigNumber.ROUND_FLOOR).toFixed(),
    })
  } else {
    const senderAmountAtomic = utils.getAtomicValue(amount, first.address, metadata)
    method = 'getSignerSide' + kind
    Object.assign(params, {
      senderAmount: senderAmountAtomic.integerValue(BigNumber.ROUND_FLOOR).toFixed(),
    })
  }

  return {
    format,
    side,
    signerToken,
    senderToken,
    method,
    params,
  }
}

function getHighestLightSigner(results) {
  let best: any
  let bestAmount = 0
  let length = results.length
  while (length-- > 0) {
    if (results[length].signerAmount > bestAmount) {
      best = results[length]
      bestAmount = best.signerAmount
    }
  }
  return best
}

function getLowestLightSender(results) {
  let best: any
  let bestAmount = Infinity
  let length = results.length
  while (length-- > 0) {
    if (results[length].senderAmount < bestAmount) {
      best = results[length]
      bestAmount = best.senderAmount
    }
  }
  return best
}

export function validateFullResponse(err: any, result: any, method: any, params: any, locator: any) {
  if (err) {
    throw err
  } else {
    if (method.indexOf('Order') !== -1) {
      if (isValidOrder(result)) {
        if (method.indexOf('Sender') !== -1) {
          if (result.signer.amount === params.signerAmount) {
            return result
          } else {
            throw 'Signer amount does not match request'
          }
        } else {
          if (result.sender.amount === params.senderAmount) {
            return result
          } else {
            throw 'Sender amount does not match request'
          }
        }
      } else {
        throw 'Received an invalid order'
      }
    } else if (method.indexOf('Quote') !== -1) {
      if (isValidQuote(result)) {
        result.locator = locator
        return result
      } else {
        throw 'Received an invalid quote'
      }
    } else {
      return result
    }
  }
}

export function validateLightResponse(err: any, result: any, method: any, params: any) {
  if (err) {
    throw err
  } else {
    if (isValidLightOrder(result)) {
      if (method.indexOf('Sender') !== -1) {
        if (result.signerAmount === params.signerAmount) {
          return result
        } else {
          throw 'Signer amount does not match request'
        }
      } else {
        if (result.senderAmount === params.senderAmount) {
          return result
        } else {
          throw 'Sender amount does not match request'
        }
      }
    } else {
      throw 'Received an invalid order'
    }
  }
}
