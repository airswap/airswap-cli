import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, confirm, cancelled } from '../../lib/prompt'

const WETH9 = require('@airswap/tokens/build/contracts/WETH9.json')

export default class IntentUnset extends Command {
  static description = 'deposit eth to weth'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, IntentUnset.description, chainId)

      const WETH = metadata.bySymbol['WETH']
      const balance = await wallet.provider.getBalance(wallet.address)
      const balanceDecimal = utils.getDecimalValue(balance.toString(), WETH.addr, metadata)
      this.log(`ETH available to deposit: ${chalk.bold(balanceDecimal.toFixed())}`)
      this.log(chalk.gray('Some ETH must be saved to execute the transaction.\n'))

      const { amount }: any = await get({
        amount: {
          description: 'amount to deposit',
          type: 'Number',
        },
      })
      const atomicAmount = utils.getAtomicValue(amount, WETH.addr, metadata)

      if (atomicAmount.eq(0)) {
        cancelled('Amount must be greater than zero.')
      } else if (balance.lt(atomicAmount.toString())) {
        cancelled('Insufficient balance.')
      } else {
        this.log()
        if (
          await confirm(
            this,
            metadata,
            'deposit',
            {
              '[value]': `${atomicAmount} (${chalk.cyan(amount)})`,
            },
            chainId,
          )
        ) {
          new ethers.Contract(WETH.addr, WETH9.abi, wallet)
            .deposit({ value: ethers.utils.bigNumberify(atomicAmount.toFixed()), gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
