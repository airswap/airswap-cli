import { cli } from 'cli-ux'
import chalk from 'chalk'
import * as keytar from 'keytar'
import { ethers } from 'ethers'
import * as emoji from 'node-emoji'

import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'
import BigNumber from 'bignumber.js'

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
    const publicAddress = wallet.address

    const balance = await provider.getBalance(publicAddress)
    if (requireBalance && balance.eq(0)) {
      ctx.log(chalk.yellow(`Account (${publicAddress}) must hold (${selectedNetwork}) ETH to execute transactions.\n`))
    } else {
      let balanceLabel = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(18)).toFixed()
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
    await updateMetadata(ctx)
  }
  return require(metadataPath)
}

export async function updateMetadata(ctx: any) {
  const metadataRinkeby = path.join(ctx.config.configDir, 'metadata-rinkeby.json')
  const metadataMainnet = path.join(ctx.config.configDir, 'metadata-mainnet.json')

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

        const byAddress: { [index: string]: any } = {}
        const bySymbol: { [index: string]: any } = {}
        for (let i in data.tokens) {
          bySymbol[data.tokens[i].name] = data.tokens[i]
          byAddress[data.tokens[i].addr] = data.tokens[i]
        }

        await fs.outputJson(metadataMainnet, {
          bySymbol,
          byAddress,
        })
        ctx.log(`Mainnet saved to: ${metadataMainnet}`)

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

        cli.action.stop()
        ctx.log(chalk.green('Local metadata updated\n'))
        resolve()
      })
      .catch((error: any) => reject(error))
  })
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
