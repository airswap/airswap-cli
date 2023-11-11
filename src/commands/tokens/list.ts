import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'
import { Registry } from '@airswap/libraries'

export default class RegistryList extends Command {
  public static description = 'list supported tokens from registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, RegistryList.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)
      const tokens = await registryContract.getTokensForStaker(wallet.address)

      const result = []
      tokens.map((address) => {
        const token = metadata.byAddress[address.toLowerCase()]
        result.push({
          Symbol: token.symbol,
          Address: token.address,
        })
      })
      if (result.length) {
        this.log(getTable(result))
      } else {
        this.log(chalk.yellow('No supported tokens'))
        this.log(`Add tokens you support with ${chalk.bold('tokens:add')}\n`)
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
