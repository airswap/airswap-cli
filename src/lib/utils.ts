import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as keytar from 'keytar'
import { ethers } from 'ethers'
import * as emoji from 'node-emoji'

import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'
import BigNumber from 'bignumber.js'

import { chainNames, chainCurrencies, etherscanDomains, protocols, chainIds } from '@airswap/constants'
import { ETH_GAS_STATION_URL, DEFAULT_CONFIRMATIONS, DEFAULT_GAS_PRICE, INFURA_ID } from './constants.json'
import { printOrder, confirm } from './prompt'

import { Validator } from '@airswap/protocols'
import { toDecimalString, lightOrderToParams } from '@airswap/utils'
import { fetchTokens, scrapeToken, findTokenByAddress, findTokensBySymbol } from '@airswap/metadata'

const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')
const Light = require('@airswap/light/build/contracts/Light.json')
const lightDeploys = require('@airswap/light/deploys.json')
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

export async function getNodeURL(ctx): Promise<string> {
  const chainId = await getChainId(ctx)
  const selectedChain = chainNames[chainId].toLowerCase()
  if (chainId === '56') {
    return `https://bsc-dataseed.binance.org/`
  }
  return `https://${selectedChain}.infura.io/v3/${INFURA_ID}`
}

export async function getProvider(ctx: any) {
  const provider = new ethers.providers.JsonRpcProvider(await getNodeURL(ctx))
  await provider.getNetwork()
  return provider
}

export async function getWallet(ctx: any, requireBalance?: boolean) {
  const account = await keytar.getPassword('airswap-cli', 'private-key')

  if (!account) {
    throw new Error(`No account set. Set one with ${chalk.bold('account:import')}`)
  } else {
    const chainId = await getChainId(ctx)
    const selectedCurrency = chainCurrencies[chainId]
    const signerPrivateKey = Buffer.from(account, 'hex')
    const provider = await getProvider(ctx)
    const wallet = new ethers.Wallet(signerPrivateKey, provider)

    const balance = await provider.getBalance(wallet.address)
    if (requireBalance && balance.eq(0)) {
      throw new Error(`Current account must hold ${selectedCurrency} to use this command.`)
    } else {
      const balanceLabel = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(18)).toFixed()
      ctx.log(chalk.gray(`Account ${wallet.address} (${balanceLabel} ${selectedCurrency})`))
      return wallet
    }
  }
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
  const tokens = await fetchTokens(chainId)
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

export async function getProtocol(ctx: any) {
  const { protocol } = await getConfig(ctx)
  return protocol || protocols.SERVER
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

export async function handleFullResponse(
  request: any,
  wallet: any,
  metadata: any,
  chainId: any,
  gasPrice: any,
  ctx: any,
  order: any,
) {
  if (!order) {
    ctx.log(chalk.yellow('No valid responses received.\n'))
  } else {
    ctx.log()
    ctx.log(chalk.underline.bold(`Signer: ${order.signer.wallet}\n`))
    await printOrder(ctx, request, order, wallet, metadata)
    const errors = await new Validator(chainId).checkSwap(order)

    if (errors.length) {
      ctx.log(chalk.yellow('Unable to take (as sender) for the following reasons.\n'))
      for (const e in errors) {
        ctx.log(`‣ ${Validator.getReason(errors[e])}`)
      }
      ctx.log()
    } else {
      if (
        await confirm(
          ctx,
          metadata,
          'swap',
          {
            signerWallet: order.signer.wallet,
            signerToken: order.signer.token,
            signerAmount: `${order.signer.amount} (${chalk.cyan(
              toDecimalString(order.signer.amount, metadata.byAddress[request.signerToken.address].decimals),
            )})`,
            senderWallet: `${order.sender.wallet} (${chalk.cyan('You')})`,
            senderToken: order.sender.token,
            senderAmount: `${order.sender.amount} (${chalk.cyan(
              toDecimalString(order.sender.amount, metadata.byAddress[request.senderToken.address].decimals),
            )})`,
          },
          chainId,
          'take this order',
        )
      ) {
        new ethers.Contract(swapDeploys[chainId], Swap.abi, wallet)
          .swap(order, { gasPrice })
          .then(handleTransaction)
          .catch(handleError)
      }
    }
  }
}

export async function handleLightResponse(
  request: any,
  wallet: any,
  metadata: any,
  chainId: any,
  gasPrice: any,
  ctx: any,
  order: any,
) {
  if (!order) {
    ctx.log(chalk.yellow('No valid responses received.\n'))
  } else {
    ctx.log()
    ctx.log(chalk.underline.bold(`Signer: ${order.signerWallet}\n`))

    // Light protocol does not include senderWallet
    order.senderWallet = wallet.address

    const senderTokenAllowance = await new ethers.Contract(order.senderToken, IERC20.abi, wallet).allowance(
      order.senderWallet,
      lightDeploys[chainId],
    )

    if (senderTokenAllowance.lt(order.senderAmount)) {
      ctx.log(
        chalk.yellow(
          'Unable to take (as sender) sender has not approved its token for trading. (try token:approve)\n\n',
        ),
      )
    } else if (!(await printOrder(ctx, request, order, wallet, metadata))) {
      ctx.log(chalk.yellow('Unable to take (as sender) because sender token balance is insufficient.\n\n'))
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
      new ethers.Contract(lightDeploys[chainId], Light.abi, wallet)
        .swap(...lightOrderToParams(order), { gasPrice })
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
