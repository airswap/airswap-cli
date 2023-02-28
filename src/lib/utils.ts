import { cli } from 'cli-ux'
import chalk from 'chalk'
import { ethers } from 'ethers'
import * as emoji from 'node-emoji'

import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'
import BigNumber from 'bignumber.js'

import { chainNames, etherscanDomains, chainIds } from '@airswap/constants'
import { ETH_GAS_STATION_URL, DEFAULT_CONFIRMATIONS, DEFAULT_GAS_PRICE, INFURA_ID } from './constants.json'
import { printOrder, confirm } from './prompt'

import { toDecimalString, orderERC20ToParams } from '@airswap/utils'
import { getKnownTokens } from '@airswap/metadata'

const Swap = require('@airswap/swap-erc20/build/contracts/SwapERC20.sol/SwapERC20.json')
const swapDeploys = require('@airswap/swap-erc20/deploys.js')
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')

export function displayDescription(ctx: any, title: string, chainId?: number) {
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
      chainId: chainIds.GOERLI,
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
  return chainId || chainIds.GOERLI
}

export async function getNodeURL(ctx): Promise<string> {
  const chainId = await getChainId(ctx)
  const selectedChain = chainNames[chainId].toLowerCase()
  switch(chainId) {
    case '1':
      return `https://mainnet.infura.io/v3/${INFURA_ID}`
    case '56':
      return 'https://bsc-dataseed.binance.org/'
    case '97':
      return 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    case '137':
      return 'https://polygon-rpc.com/'
    case '43113':
      return 'https://api.avax-test.network/ext/bc/C/rpc'
    case '43114':
      return 'https://api.avax.network/ext/bc/C/rpc'
    case '80001':
      return 'https://rpc-mumbai.maticvigil.com'
    default:
      return `https://${selectedChain}.infura.io/v3/${INFURA_ID}`
  }
}

export async function getProvider(ctx: any) {
  const provider = new ethers.providers.JsonRpcProvider(await getNodeURL(ctx))
  await provider.getNetwork()
  return provider
}

export async function getMetadata(ctx: any, chainId: number) {
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

export async function updateMetadata(ctx: any, chainId: number) {
  const startTime = Date.now()
  const tokens: any = (await getKnownTokens(chainId)).tokens
  const metadataPath = path.join(ctx.config.configDir, `metadata-${chainNames[chainId]}.json`)

  const bySymbol: any = {}
  const byAddress: any = {}
  for (const token of tokens) {
    bySymbol[token.symbol] = token
    byAddress[token.address] = token
  }

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
    data: { fastest, fast, average, safeLow },
  } = await axios(ETH_GAS_STATION_URL)
  return {
    fastest: fastest / 10,
    fast: fast / 10,
    average: average / 10,
    safeLow: safeLow / 10,
  }
}

export async function getGasPrice(ctx: any, asGwei?: boolean) {
  const { gasPrice } = await getConfig(ctx)
  if (asGwei) {
    return ethers.BigNumber.from(gasPrice || DEFAULT_GAS_PRICE)
  }
  return ethers.utils.parseUnits(String(gasPrice || DEFAULT_GAS_PRICE), 'gwei')
}

export function getAtomicValue(value: string, token: string, metadata: any) {
  return new BigNumber(value).multipliedBy(new BigNumber(10).pow(metadata.byAddress[token.toLowerCase()].decimals))
}

export function getDecimalValue(value: string, token: string, metadata: any) {
  return new BigNumber(value).dividedBy(new BigNumber(10).pow(metadata.byAddress[token.toLowerCase()].decimals))
}

export async function getBalanceChanges(order: any, wallet: any, metadata: any) {
  let { signerToken, signerAmount, senderWallet, senderToken, senderAmount } = order
  if (order.signer) {
    signerToken = order.signer.token
    signerAmount = order.signer.amount
    senderWallet = order.sender.wallet
    senderToken = order.sender.token
    senderAmount = order.sender.amount
  }

  const signerTokenBalance = await new ethers.Contract(signerToken, IERC20.abi, wallet).balanceOf(senderWallet)
  const senderTokenBalance = await new ethers.Contract(senderToken, IERC20.abi, wallet).balanceOf(senderWallet)

  const signerTokenBalanceDecimal = getDecimalValue(signerTokenBalance.toString(), signerToken, metadata)
  const senderTokenBalanceDecimal = getDecimalValue(senderTokenBalance.toString(), senderToken, metadata)
  const signerTokenChangeDecimal = getDecimalValue(signerAmount, signerToken, metadata)
  const senderTokenChangeDecimal = getDecimalValue(senderAmount, senderToken, metadata)
  const newSignerTokenBalance = getDecimalValue(signerTokenBalance.add(signerAmount).toString(), signerToken, metadata)
  const newSenderTokenBalance = getDecimalValue(senderTokenBalance.sub(senderAmount).toString(), senderToken, metadata)

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


export async function handleResponse(
  request: any,
  wallet: any,
  metadata: any,
  chainId: any,
  gasPrice: any,
  ctx: any,
  order: any,
  errors = []
) {
  if (!order) {
    ctx.log(chalk.yellow('No valid responses received.\n'))
    ctx.log('Errors...')
    for (let i = 0; i < errors.length; i ++) {
      ctx.log(`· ${chalk.bold(errors[i].message)}`, `(${errors[i].locator})`)
    }
    ctx.log()
  } else {
    ctx.log()
    ctx.log(chalk.underline.bold(`Signer: ${order.signerWallet}\n`))

    // Swap protocol does not include senderWallet
    order.senderWallet = wallet.address

    if (!(await printOrder(ctx, request, order, wallet, metadata))) {
      ctx.log(`${chalk.yellow('Unable to take')}: your token balance is insufficient.\n\n`)
    } else if (
      await confirm(
        ctx,
        metadata,
        'light',
        {
          signerWallet: order.signerWallet,
          signerToken: order.signerToken,
          signerAmount: `${order.signerAmount} (${chalk.cyan(
            toDecimalString(order.signerAmount, metadata.byAddress[request.signerToken.address].decimals),
          )})`,
          senderWallet: `${request.params.senderWallet} (${chalk.cyan('You')})`,
          senderToken: order.senderToken,
          senderAmount: `${order.senderAmount} (${chalk.cyan(
            toDecimalString(order.senderAmount, metadata.byAddress[request.senderToken.address].decimals),
          )})`,
        },
        chainId,
        'take this order',
      )
    ) {
      new ethers.Contract(swapDeploys[chainId], Swap.abi, wallet)
        .swapLight(...orderERC20ToParams(order), { gasPrice })
        .then(handleTransaction)
        .catch(handleError)
    }
  }
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
