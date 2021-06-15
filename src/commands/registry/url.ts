import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, confirm, cancelled } from '../../lib/prompt'

const Registry = require('@airswap/registry/build/contracts/Registry.sol/Registry.json')
const registryDeploys = require('@airswap/registry/deploys.js')

export default class RegistryAdd extends Command {
  static description = 'set server url on the registry'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, RegistryAdd.description, chainId)

      const registryAddress = registryDeploys[chainId]

      if (!registryAddress) {
        this.log(chalk.yellow('No registry found on the current chain'))
      } else {
        const registryContract = new ethers.Contract(registryAddress, Registry.abi, wallet)
        this.log(chalk.white(`Registry ${registryAddress}\n`))

        const url = (await registryContract.getURLsForStakers([wallet.address]))[0]
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
            chainId,
          )
        ) {
          registryContract
            .setURL(newURL, { gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
