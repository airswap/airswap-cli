import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import {
  getWallet,
  getMetadata,
  displayDescription,
  promptTokens,
  confirmTransaction,
  handleTransaction,
  handleError,
} from '../../lib/utils'

const constants = require('../../lib/constants.json')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentUnset extends Command {
  static description = 'unset an intent'
  async run() {
    const wallet = await getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await getMetadata(this, chainId)
    displayDescription(this, IntentUnset.description, chainId)

    const indexerAddress = indexerDeploys[chainId]
    const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    this.log(chalk.white(`Indexer ${indexerAddress}\n`))

    const { first, second } = await promptTokens(metadata)

    this.log()

    indexerContract.indexes(first.addr, second.addr, constants.protocols.HTTP_LATEST).then((index: any) => {
      if (index === constants.ADDRESS_ZERO) {
        this.log(chalk.yellow(`Pair ${first.name}/${second.name} does not exist`))
        this.log(`Create this pair with ${chalk.bold('new:pair')}\n`)
      } else {
        confirmTransaction(
          this,
          metadata,
          'unsetIntent',
          {
            signerToken: `${first.addr} (${first.name})`,
            senderToken: `${second.addr} (${second.name})`,
            protocol: `${constants.protocols.HTTP_LATEST} (HTTPS)`,
          },
          () => {
            new ethers.Contract(indexerAddress, Indexer.abi, wallet)
              .unsetIntent(first.addr, second.addr, constants.protocols.HTTP_LATEST)
              .then(handleTransaction)
              .catch(handleError)
          },
        )
      }
    })
  }
}
