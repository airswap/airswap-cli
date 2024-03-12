import chalk from 'chalk'
import { Command } from '@oclif/command'
import { get, cancelled } from '../lib/prompt'
import * as utils from '../lib/utils'
import { getWallet } from '../lib/wallet'

export default class Gas extends Command {
  public static description = 'set gas price for transactions'
  public async run() {
    utils.displayDescription(this, Gas.description)

    try {
      const wallet = await getWallet(this, true)

      const gasPrice = await utils.getGasPrice(this, true)
      const gasPriceNetwork = await wallet.getGasPrice()

      this.log(`\nCurrent network gas price: ${gasPriceNetwork.div(10 ** 9)}`)
      this.log(`Configured gas price: ${gasPrice}\n`)

      const { newGasPrice }: any = await get({
        newGasPrice: {
          description: `new gas price`,
          default: gasPrice,
          type: 'Number',
        },
      })

      await utils.updateConfig(this, {
        gasPrice: newGasPrice,
      })

      this.log(chalk.green(`\nSet configured gas price to ${newGasPrice}.\n`))
    } catch (e) {
      cancelled(e)
    }
  }
}
