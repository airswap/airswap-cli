import chalk from 'chalk'
import { Command } from '@oclif/command'
import { getTable } from 'console.table'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { confirm, cancelled, getProtocolList } from '../../lib/prompt'

import { protocolNames } from '@airswap/constants'
import { Registry } from '@airswap/libraries'

export default class ProtocolsRemove extends Command {
  public static description = 'add supported protocols to the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, ProtocolsRemove.description, chainId)

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

      const alreadySupported = await registryContract.getProtocolsForStaker(
        wallet.address
      )
      if (alreadySupported.length) {
        this.log(`Your activated protocols:\n`)
        const result = []
        alreadySupported.map((interfaceId) => {
          result.push({
            ID: interfaceId,
            Name: protocolNames[interfaceId],
          })
        })
        this.log(getTable(result))
      }

      const protocols: any = await getProtocolList(
        protocolNames,
        'protocols to deactivate (comma separated)'
      )
      const protocolIds = []
      const protocolLabels = []

      for (const interfaceId in protocols) {
        protocolIds.push(interfaceId)
        protocolLabels.push(`${interfaceId} (${protocols[interfaceId]})`)
      }

      const supportCost = (await registryContract.supportCost()).toNumber()
      const totalCost = supportCost * protocolIds.length

      this.log()
      if (
        await confirm(
          this,
          metadata,
          'removeProtocols',
          {
            protocols: protocolLabels.join('\n'),
            stake: `${totalCost / 10000} AST`,
          },
          chainId
        )
      ) {
        registryContract
          .removeProtocols(protocolIds, { gasPrice })
          .then(utils.handleTransaction)
          .catch(utils.handleError)
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
