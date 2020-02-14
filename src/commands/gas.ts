import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { get, cancelled } from '../lib/prompt'
import * as utils from '../lib/utils'

const constants = require('../lib/constants.json')

export default class Gas extends Command {
  static description = 'set gas price for transactions'
  async run() {
    utils.displayDescription(this, Gas.description)

    try {
      const { fastest, fast, average } = await utils.getCurrentGasPrices()

      const gasPrice = await utils.getGasPrice(this)

      this.log(`Current gas price: ${gasPrice}\n`)

      const { newGasPrice }: any = await get({
        newGasPrice: {
          description: `gas price (fastest=${fastest}, fast=${fast}, average=${average})`,
          default: gasPrice,
          type: 'Number',
        },
      })

      await utils.setConfig(this, {
        gasPrice: newGasPrice,
      })

      this.log(chalk.green(`\nSet gas price to ${newGasPrice}.\n`))
    } catch (e) {
      cancelled(e)
    }
  }
}
