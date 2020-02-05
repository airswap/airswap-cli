import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import * as fs from 'fs-extra'
import * as path from 'path'
import { get, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'

export default class MetadataLookup extends Command {
  static description = 'add token to local metadata'
  async run() {
    try {
      const provider = await utils.getProvider(this)
      const chainId = (await provider.getNetwork()).chainId

      this.log()
      utils.displayDescription(this, MetadataLookup.description, chainId)

      let metadataPath = path.join(this.config.configDir, 'metadata-rinkeby.json')
      if (String(chainId) === constants.chainIds.MAINNET) {
        metadataPath = path.join(this.config.configDir, 'metadata-mainnet.json')
      }

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
        this.log('Token not found in metadata.\n')
      } else {
        this.log(
          `${token.name} (${token.fullName}) · https://${constants.etherscanDomains[chainId]}/address/${token.addr} · ${token.decimals} decimals\n`,
        )
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
