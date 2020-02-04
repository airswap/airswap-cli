import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import chalk from 'chalk'
import * as fs from 'fs-extra'
import * as path from 'path'
import { get, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'

export default class MetadataAdd extends Command {
  static description = 'add token to local metadata'
  async run() {
    try {
      const provider = await utils.getProvider(this)
      const chainId = (await provider.getNetwork()).chainId

      this.log()
      utils.displayDescription(this, MetadataAdd.description, chainId)

      let metadataPath = path.join(this.config.configDir, 'metadata-rinkeby.json')
      if (String(chainId) === constants.chainIds.MAINNET) {
        metadataPath = path.join(this.config.configDir, 'metadata-mainnet.json')
      }

      const token: any = await get({
        name: {
          description: 'ticker',
          type: 'String',
        },
        fullName: {
          description: 'name',
          type: 'String',
        },
        decimals: {
          description: 'decimals',
          type: 'Number',
        },
        addr: {
          description: 'address',
          type: 'Address',
        },
      })

      token.name = token.name.toUpperCase()

      let metadata = {
        byAddress: {},
        bySymbol: {},
      }

      if (fs.pathExists(metadataPath)) {
        metadata = require(metadataPath)
      }

      this.log(
        `\n${token.name} (${token.fullName}) · https://${constants.etherscanDomains[chainId]}/address/${token.addr} · ${token.decimals} decimals`,
      )

      metadata.byAddress[token.addr] = token
      metadata.bySymbol[token.name] = token

      if (metadata.byAddress[token.addr] || metadata.bySymbol[token.name]) {
        const networkName = constants.chainNames[chainId || '4'].toUpperCase()
        const { confirm }: any = await get({
          confirm: {
            description: chalk.white(`\nToken exists in metadata. Type "yes" to overwrite it (${networkName})`),
          },
        })
        if (confirm === 'yes') {
          await fs.outputJson(metadataPath, metadata)
          this.log(chalk.green('Local metadata updated\n'))
        } else {
          this.log('\nCancelled.\n')
        }
      } else {
        await fs.outputJson(metadataPath, metadata)
        this.log(chalk.green('Local metadata updated\n'))
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
