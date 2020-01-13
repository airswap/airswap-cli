import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import setup from '../setup'
import BigNumber from 'bignumber.js'

const table = require('console.table')
const constants = require('../constants.json')
const deltaBalancesABI = require('../../deltaBalances.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class Balances extends Command {
  static description = 'Display token balances'
  async run() {
    setup(
      this,
      Balances.description,
      async (wallet: any, metadata: any) => {
        const swapAddress = swapDeploys[wallet.provider.network.chainId]
        const balancesContract = new ethers.Contract(
          constants.deltaBalances[wallet.provider.network.chainId],
          deltaBalancesABI,
          wallet,
        )
        balancesContract.walletBalances(wallet.address, Object.keys(metadata.byAddress)).then((balances: any) => {
          balancesContract
            .walletAllowances(wallet.address, swapAddress, Object.keys(metadata.byAddress))
            .then((allowances: any) => {
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
            })
        })
      },
      true,
    )
  }
}
