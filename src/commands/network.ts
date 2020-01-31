import chalk from 'chalk'
import { Command } from '@oclif/command'
import { get, cancelled } from '../lib/prompt'
import * as utils from '../lib/utils'

const constants = require('../lib/constants.json')

export default class Network extends Command {
  static description = 'set the active network'
  async run() {
    utils.displayDescription(this, Network.description)

    try {
      const { network } = await utils.getConfig(this)
      this.log(`Current network: ${network} (${constants.chainNames[network]})\n`)

      let { newNetwork }: any = await get({
        newNetwork: {
          description: 'network (e.g. 1=mainnet, 4=rinkeby)',
          default: network,
        },
      })

      if (!(newNetwork in constants.chainNames)) {
        this.log(chalk.yellow(`\n${newNetwork} is not a supported chain.\n`))
      } else {
        await utils.setConfig(this, {
          network: newNetwork,
        })

        this.log(chalk.green(`\nSet active network to ${constants.chainNames[newNetwork]}.\n`))
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
