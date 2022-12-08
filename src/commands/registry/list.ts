import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'

const Registry = require('@airswap/maker-registry/build/contracts/MakerRegistry.sol/MakerRegistry.json')
const registryDeploys = require('@airswap/maker-registry/deploys.js')

export default class RegistryList extends Command {
  static description = 'list supported tokens from registry'
  async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, RegistryList.description, chainId)

      const registryAddress = registryDeploys[chainId]

      if (!registryAddress) {
        this.log(chalk.yellow('No registry found on the current chain'))
      } else {
        const registryContract = new ethers.Contract(registryAddress, Registry.abi, wallet)
        this.log(chalk.white(`Registry ${registryAddress}\n`))

        const tokens = await registryContract.getSupportedTokens(wallet.address)

        const result = []
        tokens.map(address => {
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
          this.log(`Add tokens you support with ${chalk.bold('registry:add')}\n`)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
