import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, confirm, cancelled } from '../../lib/prompt'

import { Registry } from '@airswap/libraries'

export default class RegistryURL extends Command {
  public static description = 'set server url on the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, RegistryURL.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)
      const url = (
        await registryContract.getServerURLsForStakers([wallet.address])
      )[0]

      if (url) {
        this.log(`Current server url: ${url}\n`)
      }

      const { newURL }: any = await get({
        newURL: {
          type: 'Locator',
          description: 'server url',
        },
      })
      this.log()

      if (
        await confirm(
          this,
          metadata,
          'setURL',
          {
            url: newURL,
          },
          chainId
        )
      ) {
        registryContract
          .setServerURL(newURL, { gasPrice })
          .then(utils.handleTransaction)
          .catch(utils.handleError)
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
