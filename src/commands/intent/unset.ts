import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import * as prompts from '../../lib/prompts'
import constants from '../../lib/constants.json'

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentUnset extends Command {
  static description = 'unset an intent'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, IntentUnset.description, chainId)

    const indexerAddress = indexerDeploys[chainId]
    const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    this.log(chalk.white(`Indexer ${indexerAddress}\n`))

    const { first, second } = await prompts.promptTokens(metadata)

    this.log()

    const index = await indexerContract.indexes(first.addr, second.addr, constants.protocols.HTTP_LATEST)
    if (index === constants.ADDRESS_ZERO) {
      this.log(chalk.yellow(`Pair ${first.name}/${second.name} does not exist`))
      this.log(`Create this pair with ${chalk.bold('new:pair')}\n`)
    } else {
      if (
        await prompts.confirmTransaction(
          this,
          metadata,
          'unsetIntent',
          {
            signerToken: `${first.addr} (${first.name})`,
            senderToken: `${second.addr} (${second.name})`,
            protocol: `${constants.protocols.HTTP_LATEST} (HTTPS)`,
          },
          chainId,
        )
      ) {
        new ethers.Contract(indexerAddress, Indexer.abi, wallet)
          .unsetIntent(first.addr, second.addr, constants.protocols.HTTP_LATEST)
          .then(utils.handleTransaction)
          .catch(utils.handleError)
      }
    }
  }
}
