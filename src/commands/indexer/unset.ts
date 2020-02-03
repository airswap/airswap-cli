import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getSideAndTokens, confirm, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentUnset extends Command {
  static description = 'unset an intent'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, IntentUnset.description, chainId)

      const indexerAddress = indexerDeploys[chainId]
      const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      this.log(chalk.white(`Indexer ${indexerAddress}\n`))

      const { signerToken, senderToken }: any = await getSideAndTokens(metadata, true)

      this.log()

      const index = await indexerContract.indexes(signerToken.addr, senderToken.addr, constants.protocols.HTTP_LATEST)
      if (index === constants.ADDRESS_ZERO) {
        this.log(chalk.yellow(`Pair ${signerToken.name}/${senderToken.name} does not exist`))
        this.log(`Create this pair with ${chalk.bold('new:pair')}\n`)
      } else {
        if (
          await confirm(
            this,
            metadata,
            'unsetIntent',
            {
              signerToken: signerToken.addr,
              senderToken: senderToken.addr,
              protocol: `${constants.protocols.HTTP_LATEST} (HTTPS)`,
            },
            chainId,
          )
        ) {
          new ethers.Contract(indexerAddress, Indexer.abi, wallet)
            .unsetIntent(signerToken.addr, senderToken.addr, constants.protocols.HTTP_LATEST)
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
