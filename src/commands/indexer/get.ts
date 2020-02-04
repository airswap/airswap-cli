import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getSideAndTokens, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'
import { getTable } from 'console.table'

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentGet extends Command {
  static description = 'get intents from the indexer'

  async run() {
    try {
      const provider = await utils.getProvider(this)
      const chainId = (await provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, IntentGet.description, chainId)

      let { protocol } = await utils.getConfig(this)
      protocol = protocol || constants.protocols.HTTPS

      const indexerAddress = indexerDeploys[chainId]
      this.log(chalk.white(`Indexer ${indexerAddress}\n`))

      const { side, first, second, signerToken, senderToken }: any = await getSideAndTokens(metadata)

      const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, provider)
      const index = indexerContract.indexes(signerToken.addr, senderToken.addr, protocol)

      if (index === constants.ADDRESS_ZERO) {
        this.log(chalk.yellow(`Pair ${signerToken.name}/${senderToken.name} does not exist`))
        this.log(`Create this pair with ${chalk.bold('indexer:new')}\n`)
      } else {
        const result = await indexerContract.getLocators(
          signerToken.addr,
          senderToken.addr,
          protocol,
          constants.INDEX_HEAD,
          constants.DEFAULT_COUNT,
        )
        if (!result.locators.length) {
          this.log('\nNo locators found.')
        } else {
          let verb = 'buying'
          if (side === 'buy') {
            verb = 'selling'
          }

          this.log(
            chalk.underline.bold(
              `\nTop peers ${verb} ${first.name} for ${second.name} (${constants.protocolNames[protocol]})\n`,
            ),
          )

          const rows = []
          for (let i = 0; i < result.locators.length; i++) {
            try {
              rows.push({
                Staked: utils.getDecimalValue(result.scores[i], constants.stakingTokenAddresses[chainId], metadata),
                Locator: ethers.utils.parseBytes32String(result.locators[i]),
              })
            } catch (e) {
              rows.push({
                Staked: utils.getDecimalValue(result.scores[i], constants.stakingTokenAddresses[chainId], metadata),
                Locator: `(Could not parse (${result.locators[i]}))`,
              })
            }
          }
          this.log(getTable(rows))
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
