import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'

const Registry = require('@airswap/registry/build/contracts/Registry.sol/Registry.json')
const registryDeploys = require('@airswap/registry/deploys.json')

export default class RegistryList extends Command {
  static description = 'get list of supported tokens'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, RegistryList.description, chainId)

      const registryAddress = registryDeploys[chainId]

      if (!registryAddress) {
        this.log(chalk.yellow('No registry found on the current chain'))
      } else {
        const registryContract = new ethers.Contract(registryAddress, Registry.abi, wallet)
        this.log(chalk.white(`Registry ${registryAddress}\n`))

        const url = (await registryContract.getURLsForStakers([wallet.address]))[0]
        if (!url) {
          this.log(chalk.yellow('Server URL is not set'))
          this.log(`Set your server URL with ${chalk.bold('registry:url')}\n`)
        } else {
          this.log(chalk.white(`Server URL ${chalk.bold(url)}\n`))
        }

        const tokens = await registryContract.getSupportedTokens(wallet.address)

        const result = []
        tokens.map(address => {
          const token = metadata.byAddress[address]
          result.push({
            Symbol: token.symbol,
            Address: token.address,
          })
        })
        this.log(getTable(result))
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
