import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import * as prompts from '../../lib/prompts'
import constants from '../../lib/constants.json'

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentGet extends Command {
  static description = 'get intents from the indexer'

  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, IntentGet.description, chainId)

    const indexerAddress = indexerDeploys[chainId]
    this.log(chalk.white(`Indexer ${indexerAddress}\n`))
    const { first, second } = await prompts.promptTokens(metadata)
    this.log()

    const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    const index = indexerContract.indexes(first.addr, second.addr, constants.protocols.HTTP_LATEST)

    if (index === constants.ADDRESS_ZERO) {
      this.log(chalk.yellow(`Pair ${first.name}/${second.name} does not exist`))
      this.log(`Create this pair with ${chalk.bold('new:pair')}\n`)
    } else {
      const result = await indexerContract.getLocators(
        first.addr,
        second.addr,
        constants.protocols.HTTP_LATEST,
        constants.INDEX_HEAD,
        constants.DEFAULT_COUNT,
      )
      if (!result.locators.length) {
        this.log('No locators found.')
      } else {
        this.log(chalk.underline(`Top peers trading ${first.name}/${second.name}\n`))

        for (let i = 0; i < result.locators.length; i++) {
          try {
            this.log(`${i + 1}. ${ethers.utils.parseBytes32String(result.locators[i])} (${result.scores[i]})`)
          } catch (e) {
            this.log(`${i + 1}. Could not parse (${result.locators[i]})`)
          }
        }
      }
      this.log()
    }
  }
}
