import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, confirm, cancelled } from '../../lib/prompt'

const Indexers = require('@airswap/indexers/build/contracts/Indexers.sol/Indexers.json')
const indexersDeploys = require('@airswap/indexers/deploys.js')

export default class IndexersSet extends Command {
  static description = 'set server url on the indexers indexers'
  async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, IndexersSet.description, chainId)

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

        const { newURL }: any = await get({
          newURL: {
            type: 'Locator',
            description: 'indexer server url',
          },
        })
        this.log()

        if (
          await confirm(
            this,
            metadata,
            'setURL',
            {
              url: newURL,
            },
            chainId,
          )
        ) {
          indexersContract
            .setURL(newURL, { gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
