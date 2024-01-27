import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../lib/utils'
import { getWallet } from '../lib/wallet'
import { getTable } from 'console.table'
import { cancelled } from '../lib/prompt'
import { toDecimalString } from '@airswap/utils'
import { BatchCall } from '@airswap/libraries'

export default class Balances extends Command {
  public static description = 'display token balances'
  public async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, Balances.description, chainId)

      const startTime = Date.now()

      const addresses = Object.keys(metadata.byAddress)
      for (let i = addresses.length; i >= 0; i--) {
        if (!ethers.utils.isAddress(addresses[i])) {
          addresses.splice(i, 1)
        }
      }

      this.log(`Checking balances for ${addresses.length} tokens...\n`)

      const batchCallContract = BatchCall.getContract(wallet, chainId)
      const chunk = 750
      const count = addresses.length
      let balances = []
      let index = 0
      while (index < count) {
        balances = balances.concat(
          await batchCallContract.walletBalances(
            wallet.address,
            addresses.slice(index, index + chunk)
          )
        )
        index += chunk
      }

      const result = []
      for (let i = 0; i < addresses.length; i++) {
        const token = metadata.byAddress[addresses[i]]
        if (!balances[i].eq(0)) {
          const balanceDecimal = toDecimalString(
            balances[i],
            metadata.byAddress[token.address].decimals
          )
          result.push({
            Token: token.symbol,
            Balance: balanceDecimal,
          })
        }
      }

      if (result.length) {
        this.log(getTable(result))
        this.log(
          `Balances displayed for ${result.length} of ${
            addresses.length
          } known tokens. (${Date.now() - startTime}ms)\n`
        )
      } else {
        this.log(
          `The current account holds no balances in any of ${addresses.length} known tokens.\n`
        )
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
