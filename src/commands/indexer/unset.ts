import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getSideAndTokens, confirm, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const Index = require('@airswap/indexer/build/contracts/Index.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentUnset extends Command {
  static description = 'unset an intent'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const protocol = await utils.getProtocol(this)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, IntentUnset.description, chainId)

      const indexerAddress = indexerDeploys[chainId]
      const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      this.log(chalk.white(`Indexer ${indexerAddress}\n`))
      const { signerToken, senderToken }: any = await getSideAndTokens(metadata, true)
      this.log()

      const index = await indexerContract.indexes(signerToken.addr, senderToken.addr, protocol)
      if (index === constants.ADDRESS_ZERO) {
        this.log(chalk.yellow(`Pair ${signerToken.name}/${senderToken.name} does not exist`))
        this.log(`Create this pair with ${chalk.bold('indexer:new')}\n`)
      } else {
        const existingEntry = await new ethers.Contract(index, Index.abi, wallet).getLocator(wallet.address)
        if (existingEntry === constants.LOCATOR_ZERO) {
          this.log(chalk.yellow('You do not have an existing intent to unset.\n'))
        } else {
          if (
            await confirm(
              this,
              metadata,
              'unsetIntent',
              {
                signerToken: signerToken.addr,
                senderToken: senderToken.addr,
                protocol: `${protocol} (${chalk.cyan(constants.protocolNames[protocol])})`,
              },
              chainId,
            )
          ) {
            new ethers.Contract(indexerAddress, Indexer.abi, wallet)
              .unsetIntent(signerToken.addr, senderToken.addr, protocol, { gasPrice })
              .then(utils.handleTransaction)
              .catch(utils.handleError)
          }
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
