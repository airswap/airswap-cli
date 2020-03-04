import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as keytar from 'keytar'
import { ethers } from 'ethers'
import { bigNumberify } from 'ethers/utils'
import * as emoji from 'node-emoji'

import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'
import BigNumber from 'bignumber.js'

import { chainNames } from '@airswap/constants'
import TokenMetadata from '@airswap/metadata'

import { orders } from '@airswap/order-utils'
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const constants = require('./constants.json')

export function displayDescription(ctx: any, title: string, network?: string) {
  let networkName = ''
  if (network) {
    const selectedNetwork = constants.chainNames[network || '4'].toUpperCase()
    networkName = network === '1' ? chalk.green(selectedNetwork) : chalk.cyan(selectedNetwork)
  }
  ctx.log(`\n${chalk.white.bold(title)} ${networkName}\n`)
}

export async function getConfig(ctx: any) {
  const config = path.join(ctx.config.configDir, 'config.json')
  if (!(await fs.pathExists(config))) {
    await fs.outputJson(config, {
      network: '4',
    })
  }
  return await fs.readJson(config)
}

export async function updateConfig(ctx: any, config: any) {
  const configPath = path.join(ctx.config.configDir, 'config.json')
  const existingConfig = await getConfig(ctx)
  await fs.outputJson(configPath, {
    ...existingConfig,
    ...config,
  })
}

export async function getProvider(ctx: any) {
  const { network } = await getConfig(ctx)
  const selectedNetwork = constants.chainNames[network || '4']
  return ethers.getDefaultProvider(selectedNetwork)
}

export async function getWallet(ctx: any, requireBalance?: boolean) {
  const account = await keytar.getPassword('airswap-cli', 'private-key')

  if (!account) {
    throw new Error(`No account set. Set one with ${chalk.bold('account:import')}`)
  } else {
    const { network } = await getConfig(ctx)
    const selectedNetwork = constants.chainNames[network || '4']
    const signerPrivateKey = Buffer.from(account, 'hex')
    const provider = ethers.getDefaultProvider(selectedNetwork)
    const wallet = new ethers.Wallet(signerPrivateKey, provider)

    const balance = await provider.getBalance(wallet.address)
    if (requireBalance && balance.eq(0)) {
      throw new Error(`Current account must hold (${selectedNetwork}) ETH to use this command.`)
    } else {
      const balanceLabel = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(18)).toFixed()
      ctx.log(chalk.gray(`Account ${wallet.address} (${balanceLabel} ETH)`))
      return wallet
    }
  }
}

export async function getMetadata(ctx: any, network: string) {
  const selectedNetwork = constants.chainNames[network]
  const metadataPath = path.join(ctx.config.configDir, `metadata-${selectedNetwork}.json`)
  if (!(await fs.pathExists(metadataPath))) {
    ctx.log(chalk.yellow('\nFetching remote metadata'))
    await updateMetadata(ctx, network)
  }
  let metadata = require(metadataPath)

  if (metadata.version !== ctx.config.version) {
    ctx.log(chalk.yellow('\nUpdating metadata version'))
    metadata = await updateMetadata(ctx, network)
  }
  return metadata
}

export async function updateMetadata(ctx: any, network: string) {
  const startTime = Date.now()

  const tokenMetadata = new TokenMetadata(network)
  const tokens = await tokenMetadata.fetchKnownTokens()
  const metadataPath = path.join(ctx.config.configDir, `metadata-${chainNames[network]}.json`)

  const bySymbol: any = {}
  for (const token of tokens) {
    bySymbol[token.symbol] = token
  }

  const byAddress = tokenMetadata.getTokensByAddress()

  const metadata = {
    version: ctx.config.version,
    byAddress,
    bySymbol,
  }
  await fs.outputJson(metadataPath, metadata)

  ctx.log(`${Object.keys(byAddress).length} tokens saved to: ${metadataPath}`)
  ctx.log(chalk.green(`\nLocal metadata updated. (${Date.now() - startTime}ms)\n`))

  return metadata
}

export async function getCurrentGasPrices() {
  const {
    data: { fastest, fast, average },
  } = await axios(constants.ETH_GAS_STATION_URL)
  return {
    fastest: fastest / 10,
    fast: fast / 10,
    average: average / 10,
  }
}

export async function getGasPrice(ctx: any, asGwei?: boolean) {
  const { gasPrice } = await getConfig(ctx)
  if (asGwei) {
    return bigNumberify(gasPrice || constants.DEFAULT_GAS_PRICE)
  }
  return ethers.utils.parseUnits(String(gasPrice || constants.DEFAULT_GAS_PRICE), 'gwei')
}

export async function getProtocol(ctx: any) {
  const { protocol } = await getConfig(ctx)
  return protocol || constants.protocols.HTTPS
}

export async function verifyOrder(request, order, swapAddress, wallet, metadata) {
  const errors = []

  if (!orders.isValidOrder(order)) {
    errors.push('Order has invalid params or signature')
  }
  if (order.signer.token !== request.signerToken.address || order.sender.token !== request.senderToken.address) {
    errors.push('Order tokens do not match those requested')
  }
  if (order.signature.validator && order.signature.validator.toLowerCase() !== swapAddress.toLowerCase()) {
    errors.push('Order is intended for another swap contract')
  }
  if (order.signer.wallet === order.sender.wallet) {
    errors.push('Counterparties (signer and sender) must use separate accounts')
  }
  if (request.params.signerAmount && order.signer.amount < request.params.signerAmount) {
    errors.push('Amount received (signerAmount) would be less than amount specified in request')
  }
  if (request.params.senderAmount && order.sender.amount > request.params.senderAmount) {
    errors.push('Amount sent (senderAmount) would be more than amount specified in request')
  }

  const tokenContract = new ethers.Contract(order.sender.token, IERC20.abi, wallet)
  const allowance = await tokenContract.allowance(wallet.address, swapAddress)

  if (allowance.lt(order.sender.amount)) {
    errors.push(
      `You have not approved ${chalk.bold(request.senderToken.symbol)} for trading. Approve it with ${chalk.bold(
        'token:approve',
      )}`,
    )
  }

  const { newSignerTokenBalance, newSenderTokenBalance } = await getBalanceChanges(order, wallet, metadata)

  if (newSignerTokenBalance.lt(0)) {
    errors.push('The counterparty does not have sufficient balance')
  }

  if (newSenderTokenBalance.lt(0)) {
    errors.push('You do not have sufficient balance')
  }

  return errors
}

export function getAtomicValue(value: string, token: string, metadata: any) {
  return new BigNumber(value).multipliedBy(new BigNumber(10).pow(metadata.byAddress[token].decimals))
}

export function getDecimalValue(value: string, token: string, metadata: any) {
  return new BigNumber(value).dividedBy(new BigNumber(10).pow(metadata.byAddress[token].decimals))
}

export async function getBalanceChanges(order: any, wallet: any, metadata: any) {
  const signerTokenBalance = await new ethers.Contract(order.signer.token, IERC20.abi, wallet).balanceOf(
    order.sender.wallet,
  )
  const senderTokenBalance = await new ethers.Contract(order.sender.token, IERC20.abi, wallet).balanceOf(
    order.sender.wallet,
  )

  const signerTokenBalanceDecimal = getDecimalValue(signerTokenBalance.toString(), order.signer.token, metadata)
  const senderTokenBalanceDecimal = getDecimalValue(senderTokenBalance.toString(), order.sender.token, metadata)
  const signerTokenChangeDecimal = getDecimalValue(order.signer.amount, order.signer.token, metadata)
  const senderTokenChangeDecimal = getDecimalValue(order.sender.amount, order.sender.token, metadata)
  const newSignerTokenBalance = getDecimalValue(
    signerTokenBalance.add(order.signer.amount).toString(),
    order.signer.token,
    metadata,
  )
  const newSenderTokenBalance = getDecimalValue(
    senderTokenBalance.sub(order.sender.amount).toString(),
    order.sender.token,
    metadata,
  )

  return {
    signerTokenBalanceDecimal,
    signerTokenChangeDecimal,
    newSignerTokenBalance,
    senderTokenBalanceDecimal,
    senderTokenChangeDecimal,
    newSenderTokenBalance,
  }
}

export function getByLowestSenderAmount(results) {
  let lowest = results[0]
  for (var j = 1; j < results.length; j++) {
    if (new BigNumber(results[j].order.sender.amount).lt(lowest.order.sender.amount)) {
      lowest = results[j]
    }
  }
  return { best: lowest.order, locator: lowest.locator }
}

export function getByHighestSignerAmount(results) {
  let highest = results[0]
  for (var j = 1; j < results.length; j++) {
    if (new BigNumber(results[j].order.signer.amount).gt(highest.order.signer.amount)) {
      highest = results[j]
    }
  }
  return { best: highest.order, locator: highest.locator }
}

export function handleTransaction(tx: any) {
  console.log(chalk.underline(`https://${constants.etherscanDomains[tx.chainId]}/tx/${tx.hash}\n`))
  cli.action.start(`Mining transaction (${constants.chainNames[tx.chainId]})`)
  tx.wait(constants.DEFAULT_CONFIRMATIONS).then(() => {
    cli.action.stop()
    console.log(
      `${emoji.get('white_check_mark')} Transaction complete (${constants.DEFAULT_CONFIRMATIONS} confirmations)\n\n`,
    )
  })
}

export function handleError(error: any) {
  console.log(`\n${chalk.yellow('Error')}: ${error.reason || error.responseText || error}`)
  console.log('Please check your input values.\n')
}
