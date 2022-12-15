import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { confirm, cancelled } from '../../lib/prompt'

const Indexers = require('@airswap/indexer-registry/build/contracts/IndexerRegistry.sol/IndexerRegistry.json')
const indexersDeploys = require('@airswap/indexer-registry/deploys.js')

export default class IndexersUnset extends Command {
  static description = 'set server url on the indexers indexers'
  async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, IndexersUnset.description, chainId)

      const indexersAddress = indexersDeploys[chainId]

      if (!indexersAddress) {
        this.log(chalk.yellow('No indexer registries found on the current chain'))
      } else {
        const indexersContract = new ethers.Contract(indexersAddress, Indexers.abi, wallet)
        this.log(chalk.white(`Indexers ${indexersAddress}\n`))

        const url = await indexersContract.stakerURLs(wallet.address)
        if (url) {
          this.log(`Current indexer server url: ${url}\n`)
        }

        if (
          await confirm(
            this,
            metadata,
            'setURL',
            {
              url: '[blank]',
            },
            chainId,
          )
        ) {
          indexersContract
            .setURL('', { gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
