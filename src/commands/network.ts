import * as path from 'path'
import * as fs from 'fs-extra'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import * as utils from '../lib/utils'

const constants = require('../lib/constants.json')

export default class Network extends Command {
  static description = 'set the active network'
  async run() {
    utils.displayDescription(this, Network.description)

    const { network } = await utils.getConfig(this)
    this.log(`Current network: ${network} (${constants.chainNames[network]})\n`)

    const newNetwork = await cli.prompt('network (e.g. 1=mainnet, 4=rinkeby)', { default: network })

    if (!(newNetwork in constants.chainNames)) {
      this.log(chalk.yellow(`\n${newNetwork} is not a supported chain.\n`))
    } else {
      await utils.setConfig(this, {
        network: newNetwork,
      })

      this.log(chalk.green(`\nSet active network to ${constants.chainNames[newNetwork]}.\n`))
    }
  }
}
