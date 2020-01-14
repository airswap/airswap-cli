import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { promptTokens } from '../../utils'
import setup from '../../setup'

const constants = require('../../constants.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentGet extends Command {
  static description = 'get intents from the indexer'

  async run() {
    setup(
      this,
      IntentGet.description,
      async (wallet: any, metadata: any) => {
        const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
        this.log(chalk.white(`Indexer ${indexerAddress}\n`))
        const { first, second } = await promptTokens(metadata)
        this.log()

        const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)

        indexerContract.indexes(first.addr, second.addr, constants.protocols.HTTP_LATEST).then((index: any) => {
          if (index === constants.ADDRESS_ZERO) {
            this.log(chalk.yellow(`Pair ${first.name}/${second.name} does not exist`))
            this.log(`Create this pair with ${chalk.bold('new:pair')}\n`)
          } else {
            indexerContract
              .getLocators(
                first.addr,
                second.addr,
                constants.protocols.HTTP_LATEST,
                constants.INDEX_HEAD,
                constants.DEFAULT_COUNT,
              )
              .then((result: any) => {
                if (!result.locators.length) {
                  this.log('No locators found.')
                } else {
                  this.log(
                    chalk.underline(`Top ${constants.DEFAULT_COUNT} peers trading ${first.name}/${second.name}\n`),
                  )

                  for (let i = 0; i < result.locators.length; i++) {
                    try {
                      this.log(`${i + 1}. ${ethers.utils.parseBytes32String(result.locators[i])} (${result.scores[i]})`)
                    } catch (e) {
                      this.log(`${i + 1}. Could not parse (${result.locators[i]})`)
                    }
                  }
                }
                this.log()
              })
              .catch((err: Error) => {
                this.error(err)
              })
          }
        })
      },
      true,
    )
  }
}
