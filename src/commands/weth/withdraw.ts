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

      const WETH = metadata.bySymbol['WETH']
      const tokenContract = new ethers.Contract(WETH.addr, WETH9.abi, wallet)
      const tokenBalance = await tokenContract.balanceOf(wallet.address)
      const balanceDecimal = utils.getDecimalValue(tokenBalance.toString(), WETH.addr, metadata)
      this.log(`Available to withdraw: ${chalk.bold(balanceDecimal.toFixed())}\n`)

      const { amount }: any = await get({
        amount: {
          description: 'amount to withdraw',
          type: 'Number',
        },
      })
      const atomicAmount = utils.getAtomicValue(amount, WETH.addr, metadata)

      if (atomicAmount.eq(0)) {
        cancelled('Amount must be greater than zero.')
      } else if (tokenBalance.lt(atomicAmount.toString())) {
        cancelled('Insufficient balance to withdraw.')
      } else {
        this.log()
        if (
          await confirm(
            this,
            metadata,
            'withdraw',
            {
              amount: `${atomicAmount} (${chalk.cyan(amount)})`,
            },
            chainId,
          )
        ) {
          new ethers.Contract(WETH.addr, WETH9.abi, wallet)
            .withdraw(ethers.utils.bigNumberify(atomicAmount.toFixed()))
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
