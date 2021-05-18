import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'
import { getTable } from 'console.table'
import { protocolNames, stakingTokenAddresses, ADDRESS_ZERO, INDEX_HEAD } from '@airswap/constants'
import { toDecimalString } from '@airswap/utils'

const Registry = require('@airswap/registry/build/contracts/Registry.sol/Registry.json')
const registryDeploys = require('@airswap/registry/deploys.json')

export default class RegistryGet extends Command {
  static description = 'get intents from the registry'

  async run() {
    try {
      const provider = await utils.getProvider(this)
      const chainId = (await provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, RegistryGet.description, chainId)

      const registryAddress = registryDeploys[chainId]
      this.log(chalk.white(`Registry ${registryAddress}\n`))

      const { pair }: any = await get({
        pair: {
          description: 'Token pair (e.g. WETH/USDT)',
        },
      })

      const [one, two] = pair.split('/')
      const first = metadata.bySymbol[one.toUpperCase()]
      const second = metadata.bySymbol[two.toUpperCase()]

      const registryContract = new ethers.Contract(registryAddress, Registry.abi, provider)
      const signerURLs = await registryContract.getURLsForToken(first.address)
      const senderURLs = await registryContract.getURLsForToken(second.address)

      const urls = signerURLs.filter(value => senderURLs.includes(value))

      const rows = []
      for (let i = 0; i < urls.length; i++) {
        rows.push({
          Server: urls[i],
        })
      }
      this.log()
      this.log(getTable(rows))
    } catch (e) {
      cancelled(e)
    }
  }
}
