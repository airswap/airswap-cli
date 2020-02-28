import chalk from 'chalk'
import { Command } from '@oclif/command'
import { get, cancelled } from '../lib/prompt'
import * as utils from '../lib/utils'

export default class Gas extends Command {
  static description = 'set gas price for transactions'
  async run() {
    utils.displayDescription(this, Gas.description)

    try {
      const { fastest, fast, average } = await utils.getCurrentGasPrices()

      const gasPrice = await utils.getGasPrice(this, true)

      this.log(`Current gas price: ${gasPrice}\n`)

      const { newGasPrice }: any = await get({
        newGasPrice: {
          description: `gas price (fastest=${fastest}, fast=${fast}, average=${average})`,
          default: gasPrice,
          type: 'Number',
        },
      })

      await utils.updateConfig(this, {
        gasPrice: newGasPrice,
      })

      this.log(chalk.green(`\nSet gas price to ${newGasPrice}.\n`))
    } catch (e) {
      cancelled(e)
    }
  }
}
