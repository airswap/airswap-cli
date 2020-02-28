import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getSideAndTokens, confirm, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentNew extends Command {
  static description = 'create an index for a new token pair'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
      const metadata = await utils.getMetadata(this, chainId)
      const protocol = await utils.getProtocol(this)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, IntentNew.description, chainId)

      const indexerAddress = indexerDeploys[chainId]
      const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      this.log(chalk.white(`Indexer ${indexerAddress}\n`))

      const { signerToken, senderToken }: any = await getSideAndTokens(metadata, true)

      this.log()

      indexerContract.indexes(signerToken.address, senderToken.address, protocol).then(async (index: any) => {
        if (index !== constants.ADDRESS_ZERO) {
          this.log(`${chalk.yellow('Index already exists')}`)
          this.log(`Set intent on this index with ${chalk.bold('indexer:set')}\n`)
        } else {
          if (
            await confirm(
              this,
              metadata,
              'createIndex',
              {
                signerToken: `${signerToken.address} (${signerToken.symbol})`,
                senderToken: `${senderToken.address} (${senderToken.symbol})`,
              },
              chainId,
            )
          ) {
            indexerContract
              .createIndex(signerToken.address, senderToken.address, protocol, { gasPrice })
              .then(utils.handleTransaction)
              .catch(utils.handleError)
          }
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
