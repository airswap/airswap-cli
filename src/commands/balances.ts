import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../lib/utils'
import { getWallet } from '../lib/wallet'
import { getTable } from 'console.table'
import { cancelled } from '../lib/prompt'
import { toDecimalString } from '@airswap/utils'

import BalanceChecker from '@airswap/balances/build/contracts/BalanceChecker.json'
import balancesDeploys from '@airswap/balances/deploys.js'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const swapDeploys = require('@airswap/swap-erc20/deploys.js')

const balancesInterface = new ethers.utils.Interface(JSON.stringify(BalanceChecker.abi))

export default class Balances extends Command {
  static description = 'display token balances'
  async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, Balances.description, chainId)

      const startTime = Date.now()

      if (!balancesDeploys[chainId]) {
        throw new Error('Unable to check balances on this chain.')
      }

      const balancesContract = new ethers.Contract(balancesDeploys[chainId], balancesInterface, wallet)

      const addresses = Object.keys(metadata.byAddress)
      for (let i = addresses.length; i >= 0; i--) {
        if (!ethers.utils.isAddress(addresses[i])) {
          addresses.splice(i, 1)
        }
      }

      this.log(`Checking balances for ${addresses.length} tokens...\n`)

      const chunk = 750
      const count = addresses.length
      let balances = []
      let index = 0
      while (index < count) {
        balances = balances.concat(
          await balancesContract.walletBalances(wallet.address, addresses.slice(index, index + chunk)),
        )
        index += chunk
      }

      const result = []
      for (let i = 0; i < addresses.length; i++) {
        const token = metadata.byAddress[addresses[i]]
        if (!balances[i].eq(0)) {
          const balanceDecimal = toDecimalString(balances[i], metadata.byAddress[token.address].decimals)
          result.push({
            Token: token.symbol,
            Balance: balanceDecimal,
          })
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
      cancelled(e)
    }
  }
}
