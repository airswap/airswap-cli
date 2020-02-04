import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, confirm, cancelled } from '../../lib/prompt'

const WETH9 = require('@airswap/tokens/build/contracts/WETH9.json')

export default class IntentUnset extends Command {
  static description = 'withdraw eth from weth'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, IntentUnset.description, chainId)

      const { amount }: any = await get({
        amount: {
          description: 'Amount to withdraw',
          type: 'Number',
        },
      })

      const WETH = metadata.bySymbol['WETH']
      const balance = await wallet.provider.getBalance(wallet.address)
      const payableAmount = utils.getAtomicValue(amount, WETH.addr, metadata)

      if (balance.lt(payableAmount.toString())) {
        cancelled('Insufficient balance.')
      } else {
        this.log()
        if (
          await confirm(
            this,
            metadata,
            'withdraw',
            {
              amount: `${payableAmount} (${chalk.cyan(amount)})`,
            },
            chainId,
          )
        ) {
          new ethers.Contract(WETH.addr, WETH9.abi, wallet)
            .withdraw(ethers.utils.bigNumberify(payableAmount.toFixed()))
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
