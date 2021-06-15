import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getSideAndTokens, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'
import { getTable } from 'console.table'
import { protocolNames, stakingTokenAddresses, ADDRESS_ZERO, INDEX_HEAD } from '@airswap/constants'
import { toDecimalString } from '@airswap/utils'

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentGet extends Command {
  static description = 'get intents from the indexer'

  async run() {
    try {
      const provider = await utils.getProvider(this)
      const chainId = (await provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const protocol = await utils.getProtocol(this)
      utils.displayDescription(this, IntentGet.description, chainId)

      const indexerAddress = indexerDeploys[chainId]
      this.log(chalk.white(`Indexer ${indexerAddress}\n`))
      this.log('As a taker, I intend to:\n')

      const { side, first, second, signerToken, senderToken }: any = await getSideAndTokens(metadata)

      const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, provider)
      const index = indexerContract.indexes(signerToken.address, senderToken.address, protocol)

      if (index === ADDRESS_ZERO) {
        this.log(chalk.yellow(`${signerToken.symbol}/${senderToken.symbol} does not exist`))
        this.log(`Create this index with ${chalk.bold('indexer:new')}\n`)
      } else {
        const result = await indexerContract.getLocators(
          signerToken.address,
          senderToken.address,
          protocol,
          INDEX_HEAD,
          constants.MAX_LOCATORS,
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
              `\nTop peers ${verb} ${first.symbol} for ${second.symbol} (${protocolNames[protocol]})\n`,
            ),
          )

          const rows = []
          for (let i = 0; i < result.locators.length; i++) {
            try {
              rows.push({
                Staked: toDecimalString(result.scores[i], metadata.byAddress[stakingTokenAddresses[chainId]].decimals),
                Locator: ethers.utils.parseBytes32String(result.locators[i]),
              })
            } catch (e) {
              rows.push({
                Staked: toDecimalString(result.scores[i], metadata.byAddress[stakingTokenAddresses[chainId]].decimals),
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
