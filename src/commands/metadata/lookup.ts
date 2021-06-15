import { Command } from '@oclif/command'
import chalk from 'chalk'
import * as utils from '../../lib/utils'
import * as fs from 'fs-extra'
import * as path from 'path'
import { get, cancelled } from '../../lib/prompt'
import { chainNames, etherscanDomains } from '@airswap/constants'

export default class MetadataLookup extends Command {
  static description = 'lookup token in local metadata'
  async run() {
    try {
      const provider = await utils.getProvider(this)
      const chainId = (await provider.getNetwork()).chainId

      this.log()
      utils.displayDescription(this, MetadataLookup.description, chainId)

      const metadataPath = path.join(this.config.configDir, `metadata-${chainNames[chainId]}.json`)

      const { needle }: any = await get({
        needle: {
          description: 'ticker or address',
          type: 'String',
        },
      })

      let metadata = {
        byAddress: {},
        bySymbol: {},
      }

      if (await fs.pathExists(metadataPath)) {
        metadata = require(metadataPath)
      }

      let token

      if (needle.toUpperCase() in metadata.bySymbol) {
        token = metadata.bySymbol[needle.toUpperCase()]
      }
      if (needle in metadata.byAddress) {
        token = metadata.byAddress[needle]
      }

      this.log()
      if (!token) {
        this.log(chalk.yellow('Token not found in metadata'))
        this.log(`Add a new token with ${chalk.bold('metadata:add')}\n`)
      } else {
        this.log(
          `${token.symbol} (${token.name}) · https://${etherscanDomains[chainId]}/address/${token.address} · ${token.decimals} decimals\n`,
        )
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
