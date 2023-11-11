import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'
import { Registry } from '@airswap/libraries'

import { protocolNames, stakingTokenAddresses } from '@airswap/constants'

export default class RegistryList extends Command {
  public static description = 'list supported protocols from registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, RegistryList.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)
      const protocols = await registryContract.getProtocolsForStaker(
        wallet.address
      )

      const result = []
      protocols.map((interfaceId) => {
        result.push({
          ID: interfaceId,
          name: protocolNames[interfaceId],
        })
      })
      if (result.length) {
        this.log(getTable(result))
      } else {
        this.log(chalk.yellow('No supported protocols'))
        this.log(
          `Add protocols you support with ${chalk.bold('protocols:add')}\n`
        )
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
