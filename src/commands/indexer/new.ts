import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getTokens, confirm } from '../../lib/prompt'
import constants from '../../lib/constants.json'

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentNew extends Command {
  static description = 'create an index for a new token pair'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, IntentNew.description, chainId)

    const indexerAddress = indexerDeploys[chainId]
    const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    this.log(chalk.white(`Indexer ${indexerAddress}\n`))

    const { signerToken, senderToken }: any = await getTokens(
      { signerToken: 'signerToken', senderToken: 'senderToken' },
      metadata,
    )

    this.log()

    indexerContract
      .indexes(signerToken.addr, senderToken.addr, constants.protocols.HTTP_LATEST)
      .then(async (index: any) => {
        if (index !== constants.ADDRESS_ZERO) {
          this.log(`${chalk.yellow('Pair already exists')}`)
          this.log(`Set intent on this pair with ${chalk.bold('intent:set')}\n`)
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
              .createIndex(signerToken.addr, senderToken.addr, constants.protocols.HTTP_LATEST)
              .then(utils.handleTransaction)
              .catch(utils.handleError)
          }
        }
      })
  }
}
