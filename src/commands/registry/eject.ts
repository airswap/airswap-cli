import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { confirm, cancelled } from '../../lib/prompt'
import { Registry } from '@airswap/libraries'

export default class RegistryEject extends Command {
  public static description = 'remove url, protocols, and tokens from registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, RegistryEject.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)

      this.log(
        `${chalk.yellow(
          'Warning'
        )} This will entirely remove your server (url, protocols, tokens) from registry and return staked tokens.\n`
      )

      if (await confirm(this, metadata, 'unsetServer', {}, chainId)) {
        registryContract
          .unsetServer()
          .then(utils.handleTransaction)
          .catch(utils.handleError)
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
