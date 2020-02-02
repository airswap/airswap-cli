import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as keytar from 'keytar'
import { ethers } from 'ethers'
import * as emoji from 'node-emoji'

import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'
import BigNumber from 'bignumber.js'

import { orders } from '@airswap/order-utils'
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')

const constants = require('./constants.json')

export function displayDescription(ctx: any, title: string, network?: number) {
  let networkName = ''
  if (network) {
    const selectedNetwork = constants.chainNames[network || '4'].toUpperCase()
    networkName = network === 1 ? chalk.green(selectedNetwork) : chalk.cyan(selectedNetwork)
  }
  ctx.log(`${chalk.white.bold(title)} ${networkName}\n`)
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

export async function setConfig(ctx: any, config: any) {
  const configPath = path.join(ctx.config.configDir, 'config.json')
  await fs.outputJson(configPath, config)
}

export async function getProvider(ctx: any) {
  const { network } = await getConfig(ctx)
  const selectedNetwork = constants.chainNames[network || '4']
  return ethers.getDefaultProvider(selectedNetwork)
}

export async function getWallet(ctx: any, requireBalance?: boolean) {
  const account = await keytar.getPassword('airswap-maker-kit', 'private-key')

  if (!account) {
    throw new Error(`No account set. Set one with ${chalk.bold('account:set')}`)
  } else {
    const { network } = await getConfig(ctx)
    const selectedNetwork = constants.chainNames[network || '4']
    const signerPrivateKey = Buffer.from(account, 'hex')
    const provider = ethers.getDefaultProvider(selectedNetwork)
    const wallet = new ethers.Wallet(signerPrivateKey, provider)

    const balance = await provider.getBalance(wallet.address)
    if (requireBalance && balance.eq(0)) {
      ctx.log(chalk.yellow(`Account (${wallet.address}) must hold (${selectedNetwork}) ETH to execute transactions.\n`))
    } else {
      const balanceLabel = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(18)).toFixed()
      ctx.log(chalk.gray(`Account ${wallet.address} (${balanceLabel} ETH)\n`))
      return wallet
    }
  }
}

export async function getMetadata(ctx: any, network: number) {
  const selectedNetwork = constants.chainNames[network]
  const metadataPath = path.join(ctx.config.configDir, `metadata-${selectedNetwork}.json`)
  if (!(await fs.pathExists(metadataPath))) {
    ctx.log(chalk.yellow('\nLocal metadata not found'))
    await updateMetadata(ctx, network)
  }
  return require(metadataPath)
}

export async function updateMetadata(ctx: any, network: number) {
  const metadataRinkeby = path.join(ctx.config.configDir, 'metadata-rinkeby.json')
  const metadataMainnetPath = path.join(ctx.config.configDir, 'metadata-mainnet.json')

  if (String(network) === constants.chainIds.MAINNET) {
    ctx.log('Updating metadata from forkdelta...')

    return new Promise((resolve, reject) => {
      axios('https://forkdelta.app/config/main.json')
        .then(async ({ data }: any) => {
          data.tokens.push({
            addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            fullName: 'Wrapped Ether',
            decimals: 18,
            name: 'WETH',
          })

          let metadata = {
            byAddress: {},
            bySymbol: {},
          }

          if (fs.pathExists(metadataMainnetPath)) {
            metadata = require(metadataMainnetPath)
          }

          for (const i in data.tokens) {
            metadata.bySymbol[data.tokens[i].name] = data.tokens[i]
            metadata.byAddress[data.tokens[i].addr] = data.tokens[i]
          }

          await fs.outputJson(metadataMainnetPath, metadata)
          ctx.log(`Mainnet saved to: ${metadataMainnetPath}`)
          ctx.log(chalk.green('Local metadata updated\n'))
          cli.action.stop()
          resolve()
        })
        .catch((error: any) => reject(error))
    })
  } else {
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
    ctx.log(`Rinkeby saved to: ${metadataRinkeby}`)
    ctx.log(chalk.green('Local metadata updated\n'))
  }
}

export async function verifyOrder(request, order, swapAddress, wallet, metadata) {
  const errors = []

  if (!orders.isValidOrder(order)) {
    errors.push('Order has invalid params or signature')
  }
  if (order.signer.token !== request.signerToken.addr || order.sender.token !== request.senderToken.addr) {
    errors.push('Order tokens do not match those requested')
  }
  if (order.signature.validator && order.signature.validator.toLowerCase() !== swapAddress.toLowerCase()) {
    errors.push('Order is intended for another swap contract')
  }

  const tokenContract = new ethers.Contract(order.sender.token, IERC20.abi, wallet)
  const allowance = await tokenContract.allowance(wallet.address, swapAddress)

  if (allowance < order.sender.amount) {
    errors.push(
      `Sender (you) has not approved ${chalk.bold(request.senderToken.name)} for trading. Approve it with ${chalk.bold(
        'token:approve',
      )}`,
    )
  }

  const { newSignerTokenBalance, newSenderTokenBalance } = await getBalanceChanges(order, wallet, metadata)

  if (newSignerTokenBalance.lt(0)) {
    errors.push('The counterparty (signer) does not have sufficient balance')
  }

  if (newSenderTokenBalance.lt(0)) {
    errors.push('You (sender) do not have sufficient balance')
  }

  return errors
}

export function getBalanceDecimal(value: string, token: string, metadata: any) {
  return new BigNumber(value).dividedBy(new BigNumber(10).pow(metadata.byAddress[token].decimals))
}

export async function getBalanceChanges(order: any, wallet: any, metadata: any) {
  const signerTokenBalance = await new ethers.Contract(order.signer.token, IERC20.abi, wallet).balanceOf(wallet.address)
  const senderTokenBalance = await new ethers.Contract(order.sender.token, IERC20.abi, wallet).balanceOf(wallet.address)

  const signerTokenBalanceDecimal = getBalanceDecimal(signerTokenBalance.toString(), order.signer.token, metadata)
  const senderTokenBalanceDecimal = getBalanceDecimal(senderTokenBalance.toString(), order.sender.token, metadata)
  const signerTokenChangeDecimal = getBalanceDecimal(order.signer.amount, order.signer.token, metadata)
  const senderTokenChangeDecimal = getBalanceDecimal(order.sender.amount, order.sender.token, metadata)
  const newSignerTokenBalance = getBalanceDecimal(
    signerTokenBalance.add(order.signer.amount).toString(),
    order.signer.token,
    metadata,
  )
  const newSenderTokenBalance = getBalanceDecimal(
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
