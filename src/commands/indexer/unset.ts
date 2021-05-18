import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getSideAndTokens, confirm, cancelled } from '../../lib/prompt'
import { protocolNames, ADDRESS_ZERO, LOCATOR_ZERO } from '@airswap/constants'

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
      this.log('As a maker, I no longer intend to:\n')

      const { signerToken, senderToken }: any = await getSideAndTokens(metadata, true)
      this.log()

      const index = await indexerContract.indexes(signerToken.address, senderToken.address, protocol)
      if (index === ADDRESS_ZERO) {
        this.log(chalk.yellow(`${signerToken.symbol}/${senderToken.symbol} does not exist`))
        this.log(`Create this index with ${chalk.bold('indexer:new')}\n`)
      } else {
        const existingEntry = await new ethers.Contract(index, Index.abi, wallet).getLocator(wallet.address)
        if (existingEntry === LOCATOR_ZERO) {
          this.log(chalk.yellow('You do not have an existing intent to unset.\n'))
        } else {
          if (
            await confirm(
              this,
              metadata,
              'unsetIntent',
              {
                signerToken: signerToken.address,
                senderToken: senderToken.address,
                protocol: `${protocol} (${chalk.cyan(protocolNames[protocol])})`,
              },
              chainId,
            )
          ) {
            new ethers.Contract(indexerAddress, Indexer.abi, wallet)
              .unsetIntent(signerToken.address, senderToken.address, protocol, { gasPrice })
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
