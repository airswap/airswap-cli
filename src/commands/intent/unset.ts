import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import setup from '../../setup'
import { promptTokens, confirmTransaction, handleTransaction, handleError } from '../../utils'

const constants = require('../../constants.json')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class UnsetIntent extends Command {
  static description = 'set an intent to trade'
  async run() {
    setup(this, 'Unset an intent to trade', async (wallet: any, metadata: any) => {
      const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
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
    })
  }
}
