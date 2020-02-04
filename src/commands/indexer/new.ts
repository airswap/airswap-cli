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
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const protocol = await utils.getProtocol(this)
      utils.displayDescription(this, IntentNew.description, chainId)

      const indexerAddress = indexerDeploys[chainId]
      const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      this.log(chalk.white(`Indexer ${indexerAddress}\n`))

      const { signerToken, senderToken }: any = await getSideAndTokens(metadata, true)

      this.log()

      indexerContract.indexes(signerToken.addr, senderToken.addr, protocol).then(async (index: any) => {
        if (index !== constants.ADDRESS_ZERO) {
          this.log(`${chalk.yellow('Pair already exists')}`)
          this.log(`Set intent on this pair with ${chalk.bold('indexer:set')}\n`)
        } else {
          if (
            await confirm(
              this,
              metadata,
              'createIndex',
              {
                signerToken: `${signerToken.addr} (${signerToken.name})`,
                senderToken: `${senderToken.addr} (${senderToken.name})`,
              },
              chainId,
            )
          ) {
            indexerContract
              .createIndex(signerToken.addr, senderToken.addr, protocol)
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
