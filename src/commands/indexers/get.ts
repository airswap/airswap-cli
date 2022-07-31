import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'

const Indexers = require('@airswap/indexers/build/contracts/Indexers.sol/Indexers.json')
const indexersDeploys = require('@airswap/indexers/deploys.js')

export default class IndexersGet extends Command {
  static description = 'get indexer server urls'

  async run() {
    try {
      const provider = await utils.getProvider(this)
      const chainId = (await provider.getNetwork()).chainId
      utils.displayDescription(this, IndexersGet.description, chainId)

      const indexersAddress = indexersDeploys[chainId]

      if (!indexersAddress) {
        this.log(chalk.yellow('No indexer registries found on the current chain'))
      } else {
        const registryContract = new ethers.Contract(indexersAddress, Indexers.abi, provider)
        const urls = await registryContract.getURLs()

        const rows = []
        for (let i = 0; i < urls.length; i++) {
          rows.push({
            Server: urls[i],
          })
        }

        if (rows.length) {
          this.log()
          this.log(getTable(rows))
        } else {
          this.log(chalk.yellow(`\nNo indexer servers currently available.\n`))
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
