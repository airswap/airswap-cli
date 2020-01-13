import * as keytar from 'keytar'
import { ethers } from 'ethers'
import chalk from 'chalk'
import * as path from 'path'
import * as fs from 'fs-extra'
import { updateMetadata } from './utils'
import BigNumber from 'bignumber.js'

const constants = require('./constants.json')

export function intro(ctx: any, title: string) {
  ctx.log(`${chalk.white.bold(title)}`)
}

export default async function setup(ctx: any, title: string, callback: Function, noBalanceCheck?: boolean) {
  const account = await keytar.getPassword('airswap-maker-kit', 'private-key')
  const config = path.join(ctx.config.configDir, 'config.json')

  if (!(await fs.pathExists(config))) {
    await fs.outputJson(config, {
      network: '4',
    })
  }

  const { network } = await fs.readJson(config)
  const selectedNetwork = constants.chainNames[network || '4']
  const networkName = network === '1' ? chalk.green(selectedNetwork) : chalk.cyan(selectedNetwork)

  intro(ctx, `${chalk.white.bold(title)} ${chalk.white.bold(networkName)}`)

  if (!account) {
    ctx.log(chalk.yellow(`\nNo account set. Set one with ${chalk.bold('account:set')}\n`))
  } else {
    const signerPrivateKey = Buffer.from(account, 'hex')
    const provider = ethers.getDefaultProvider(selectedNetwork)
    const wallet = new ethers.Wallet(signerPrivateKey, provider)
    const publicAddress = wallet.address

    const metadataPath = path.join(ctx.config.configDir, `metadata-${selectedNetwork}.json`)
    if (!(await fs.pathExists(metadataPath))) {
      await updateMetadata(ctx)
    }
    const metadata = require(metadataPath)

    provider.getBalance(publicAddress).then((balance: any) => {
      if (!noBalanceCheck && balance.eq(0)) {
        ctx.log(
          chalk.red('Error ') +
            `Current account (${publicAddress}) must have some (${selectedNetwork}) ether to execute transactions.`,
        )
        return
      }

      let balanceLabel = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(18)).toFixed()
      ctx.log(chalk.gray(`Account ${wallet.address} (${balanceLabel} ETH)\n`))
      callback(wallet, metadata)
    })
  }
}
