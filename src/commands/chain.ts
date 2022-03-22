import chalk from 'chalk'
import { Command } from '@oclif/command'
import { get, cancelled } from '../lib/prompt'
import * as utils from '../lib/utils'
import { chainNames } from '@airswap/constants'

export default class Network extends Command {
  static description = 'set the active ethereum chain'
  async run() {
    utils.displayDescription(this, Network.description)

    try {
      const chainId = await utils.getChainId(this)
      this.log(`Current chain: ${chainId} (${chainNames[chainId]})\n`)

      const { newChainId }: any = await get({
        newChainId: {
          description: 'New chain id:',
          default: chainId,
        },
      })

      if (!(newChainId in chainNames)) {
        this.log(chalk.yellow(`\n${newChainId} is not a supported chain.\n`))
      } else {
        await utils.updateConfig(this, {
          chainId: newChainId,
        })

        this.log(chalk.green(`\nSet active chain to ${chainNames[newChainId]}.\n`))
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
