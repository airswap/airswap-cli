import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../lib/utils'
import { getTable } from 'console.table'
import { balanceCheckerAddresses } from '@airswap/constants'
import deltaBalancesABI from '../lib/deltaBalances.json'
import { cancelled } from '../lib/prompt'
import { toDecimalString } from '@airswap/utils'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class Balances extends Command {
  static description = 'display token balances'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, Balances.description, chainId)

      const startTime = Date.now()
      const swapAddress = swapDeploys[chainId]
      const balancesContract = new ethers.Contract(balanceCheckerAddresses[chainId], deltaBalancesABI, wallet)

      const addresses = Object.keys(metadata.byAddress)
      const balances = await balancesContract.walletBalances(wallet.address, addresses)

      const result = []
      for (let i = 0; i < addresses.length; i++) {
        const token = metadata.byAddress[addresses[i]]
        if (!balances[i].eq(0)) {
          const balanceDecimal = toDecimalString(balances[i], metadata.byAddress[token.address].decimals)
          try {
            const tokenContract = new ethers.Contract(token.address, IERC20.abi, wallet)
            const allowance = await tokenContract.allowance(wallet.address, swapAddress)
            result.push({
              Token: token.symbol,
              Balance: balanceDecimal,
              Approved: allowance.eq(0) ? 'No' : chalk.green('Yes'),
            })
          } catch {
            continue
          }
        }
      }

      if (result.length) {
        this.log(getTable(result))
        this.log(
          `Balances displayed for ${result.length} of ${addresses.length} known tokens. (${Date.now() -
            startTime}ms)\n`,
        )
      } else {
        this.log(`The current account holds no balances in any of ${addresses.length} known tokens.\n`)
      }
    } catch (e) {
      console.log(e)
      cancelled(e)
    }
  }
}
