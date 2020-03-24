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

import { chainNames, etherscanDomains, protocols, chainIds } from '@airswap/constants'
import { ETH_GAS_STATION_URL, DEFAULT_CONFIRMATIONS, DEFAULT_GAS_PRICE } from './constants.json'

import TokenMetadata from '@airswap/metadata'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')

export function displayDescription(ctx: any, title: string, chainId?: string) {
  let chainName = ''
  if (chainId) {
    const selectedChain = chainNames[chainId].toUpperCase()
    chainName = chainId === chainIds.MAINNET ? chalk.green(selectedChain) : chalk.cyan(selectedChain)
  }
  ctx.log(`\n${chalk.white.bold(title)} ${chainName}\n`)
}

export async function getConfig(ctx: any) {
  const config = path.join(ctx.config.configDir, 'config.json')
  if (!(await fs.pathExists(config))) {
    await fs.outputJson(config, {
      chainId: chainIds.RINKEBY,
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

export async function getChainId(ctx: any): Promise<string> {
  const { chainId } = await getConfig(ctx)
  return chainId || chainIds.RINKEBY
}

export async function getProvider(ctx: any) {
  const chainId = await getChainId(ctx)
  const selectedChain = chainNames[chainId].toLowerCase()
  return ethers.getDefaultProvider(selectedChain)
}

export async function getWallet(ctx: any, requireBalance?: boolean) {
  const account = await keytar.getPassword('airswap-cli', 'private-key')

  if (!account) {
    throw new Error(`No account set. Set one with ${chalk.bold('account:import')}`)
  } else {
    const chainId = await getChainId(ctx)
    const selectedChain = chainNames[chainId].toLowerCase()
    const signerPrivateKey = Buffer.from(account, 'hex')
    const provider = ethers.getDefaultProvider(selectedChain)
    const wallet = new ethers.Wallet(signerPrivateKey, provider)

    const balance = await provider.getBalance(wallet.address)
    if (requireBalance && balance.eq(0)) {
      throw new Error(`Current account must hold (${selectedChain}) ETH to use this command.`)
    } else {
      const balanceLabel = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(18)).toFixed()
      ctx.log(chalk.gray(`Account ${wallet.address} (${balanceLabel} ETH)`))
      return wallet
    }
  }
}

export async function getMetadata(ctx: any, chainId: string) {
  const selectedChain = chainNames[chainId]
  const metadataPath = path.join(ctx.config.configDir, `metadata-${selectedChain}.json`)
  if (!(await fs.pathExists(metadataPath))) {
    ctx.log(chalk.yellow('\nFetching remote metadata'))
    await updateMetadata(ctx, chainId)
  }
  let metadata = require(metadataPath)

  if (metadata.version !== ctx.config.version) {
    ctx.log(chalk.yellow('\nUpdating metadata version'))
    metadata = await updateMetadata(ctx, chainId)
  }
  return metadata
}

export async function updateMetadata(ctx: any, chainId: string) {
  const startTime = Date.now()

  const tokenMetadata = new TokenMetadata(chainId)
  const tokens = await tokenMetadata.fetchKnownTokens()
  const metadataPath = path.join(ctx.config.configDir, `metadata-${chainNames[chainId]}.json`)

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
  } = await axios(ETH_GAS_STATION_URL)
  return {
    fastest: fastest / 10,
    fast: fast / 10,
    average: average / 10,
  }
}

export async function getGasPrice(ctx: any, asGwei?: boolean) {
  const { gasPrice } = await getConfig(ctx)
  if (asGwei) {
    return bigNumberify(gasPrice || DEFAULT_GAS_PRICE)
  }
  return ethers.utils.parseUnits(String(gasPrice || DEFAULT_GAS_PRICE), 'gwei')
}

export async function getProtocol(ctx: any) {
  const { protocol } = await getConfig(ctx)
  return protocol || protocols.SERVER
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
  console.log(chalk.underline(`https://${etherscanDomains[tx.chainId]}/tx/${tx.hash}\n`))
  cli.action.start(`Mining transaction (${chainNames[tx.chainId]})`)
  tx.wait(DEFAULT_CONFIRMATIONS).then(() => {
    cli.action.stop()
    console.log(`${emoji.get('white_check_mark')} Transaction complete (${DEFAULT_CONFIRMATIONS} confirmations)\n\n`)
  })
}

export function handleError(error: any) {
  console.log(`\n${chalk.yellow('Error')}: ${error.reason || error.responseText || error}`)
  console.log('Please check your input values.\n')
}
