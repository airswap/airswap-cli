import { cli } from 'cli-ux'
import chalk from 'chalk'
import { ethers } from 'ethers'
import * as emoji from 'node-emoji'

import * as fs from 'fs-extra'
import * as path from 'path'
import BigNumber from 'bignumber.js'

import { chainNames, explorerUrls, ChainIds, apiUrls, chainLabels } from '@airswap/utils'
import { DEFAULT_CONFIRMATIONS, DEFAULT_GAS_PRICE } from './constants.json'
import { printOrder, confirm } from './prompt'

import { getKnownTokens, toDecimalString, orderERC20ToParams } from '@airswap/utils'

const Swap = require('@airswap/swap-erc20/build/contracts/SwapERC20.sol/SwapERC20.json')
const swapDeploys = require('@airswap/swap-erc20/deploys.js')
const IERC20 = require('@openzeppelin/contracts/build/contracts/IERC20.json')

export function displayDescription(ctx: any, title: string, chainId?: number) {
  let chainName = ''
  if (chainId) {
    const selectedChain = chainNames[chainId].toUpperCase()
    chainName = chainId === ChainIds.MAINNET ? chalk.green(selectedChain) : chalk.cyan(selectedChain)
  }
  ctx.log(`\n${chalk.white.bold(title)} ${chainName}\n`)
}

export async function getConfig(ctx: any) {
  const config = path.join(ctx.config.configDir, 'config.json')
  if (!(await fs.pathExists(config))) {
    await fs.outputJson(config, {
      chainId: ChainIds.SEPOLIA,
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
  if (!ChainIds[chainId]) throw `Chain ${chainId} not supported. Change with chain command.`
  return chainId || ChainIds.SEPOLIA
}

export async function getNodeURL(ctx): Promise<string> {
  const chainId = await getChainId(ctx)
  return apiUrls[chainId]
}

export async function getProvider(ctx: any) {
  const provider = new ethers.providers.JsonRpcProvider(await getNodeURL(ctx))
  await provider.getNetwork()
  return provider
}

export async function getMetadata(ctx: any, chainId: number) {
  const metadataPath = path.join(ctx.config.configDir, `metadata-${chainLabels[chainId]}.json`)
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
  const tokens: any = (await getKnownTokens(Number(chainId))).tokens
  const metadataPath = path.join(ctx.config.configDir, `metadata-${chainLabels[chainId]}.json`)

  const bySymbol: any = {}
  const byAddress: any = {}
  for (const token of tokens) {
    token.address = token.address.toLowerCase()
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

export async function getGasPrice(ctx: any, asGwei?: boolean) {
  const provider = new ethers.providers.JsonRpcProvider(await getNodeURL(ctx))
  await provider.getNetwork()
  const gasPrice = await provider.getGasPrice()
  if (asGwei) {
    return ethers.utils.formatUnits(gasPrice.toString(), 'gwei')
  }
  return ethers.BigNumber.from(gasPrice || DEFAULT_GAS_PRICE)
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
  for (let j = 1; j < results.length; j++) {
    if (new BigNumber(results[j].order.sender.amount).lt(lowest.order.sender.amount)) {
      lowest = results[j]
    }
  }
  return { best: lowest.order, locator: lowest.locator }
}

export function getByHighestSignerAmount(results) {
  let highest = results[0]
  for (let j = 1; j < results.length; j++) {
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
  url: string,
  errors = []
) {
  if (order) {
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
        'swapLight',
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
        .swapLight(...orderERC20ToParams(order))
        .then(handleTransaction)
        .catch(handleError)
    }
  } else {
    if (errors.length) {
      ctx.log(chalk.yellow('No valid responses received.\n'))
      ctx.log('Errors...')
      for (let i = 0; i < errors.length; i ++) {
        ctx.log(`· ${chalk.bold(errors[i].message)}`, `(${errors[i].locator})`)
      }
      ctx.log()
    } else {
      ctx.log(`${chalk.yellow('No servers found.')} Protocol: RequestForQuoteERC20\n`)
    }
  }
}

export function handleTransaction(tx: any) {
  console.log(chalk.underline(`${explorerUrls[tx.chainId]}/tx/${tx.hash}\n`))
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
