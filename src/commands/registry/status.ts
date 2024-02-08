import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'
import { Registry } from '@airswap/libraries'
import { protocolNames } from '@airswap/utils'

export default class RegistryStatus extends Command {
  public static description =
    'check status of url, protocols, and tokens on registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, RegistryStatus.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)
      const url = (
        await registryContract.getServerURLsForStakers([wallet.address])
      )[0]
      if (!url) {
        this.log(chalk.yellow('\nServer URL is not set'))
        this.log(`Set your server URL with ${chalk.bold('registry:url')}\n`)
      } else {
        this.log(chalk.white(`Server URL ${chalk.bold(url)}\n`))
      }

      const supportedProtocols = await registryContract.getProtocolsForStaker(
        wallet.address
      )
      if (supportedProtocols.length) {
        this.log(`${chalk.bold('Protocols')} currently activated:\n`)
        const result = []
        supportedProtocols.map((id) => {
          result.push({
            id,
            label: protocolNames[id],
          })
        })
        this.log(getTable(result))
      } else {
        this.log(chalk.yellow('No activated protocols'))
        this.log(
          `Add protocols you support with ${chalk.bold('protocols:add')}\n`
        )
        process.exit(0)
      }

      const supportedTokens = await registryContract.getTokensForStaker(
        wallet.address
      )
      if (supportedTokens.length) {
        this.log(`${chalk.bold('Tokens')} currently activated:\n`)
        const result = []
        supportedTokens.map((address) => {
          const token = metadata.byAddress[address.toLowerCase()]
          result.push({
            symbol: token.symbol,
            address: token.address,
          })
        })
        this.log(getTable(result))
      } else {
        this.log(chalk.yellow('No activated tokens'))
        this.log(`Add tokens you support with ${chalk.bold('tokens:add')}\n`)
        process.exit(0)
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
