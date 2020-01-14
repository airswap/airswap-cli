import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../lib/utils'
import BigNumber from 'bignumber.js'

const table = require('console.table')
const constants = require('../lib/constants.json')
const deltaBalancesABI = require('../lib/deltaBalances.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class Balances extends Command {
  static description = 'display token balances'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, Balances.description, chainId)

    const swapAddress = swapDeploys[chainId]
    const balancesContract = new ethers.Contract(constants.deltaBalances[chainId], deltaBalancesABI, wallet)
    const balances = await balancesContract.walletBalances(wallet.address, Object.keys(metadata.byAddress))
    const allowances = await balancesContract.walletAllowances(
      wallet.address,
      swapAddress,
      Object.keys(metadata.byAddress),
    )

    let i = 0
    const result = []
    for (let token in metadata.byAddress) {
      if (!balances[i].eq(0)) {
        const balanceDecimal = new BigNumber(balances[i].toString())
          .dividedBy(new BigNumber(10).pow(metadata.byAddress[token].decimals))
          .toFixed()

        result.push({
          Token: metadata.byAddress[token].name,
          Balance: balanceDecimal,
          Approved: allowances[i].eq(0) ? 'No' : chalk.green('Yes'),
        })
      }
      i++
    }
    this.log(table.getTable(result))
    this.log(`Balances displayed for ${result.length} of ${i} known tokens.\n`)
  }
}
