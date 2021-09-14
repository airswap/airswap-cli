import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { getTokenList, confirm, cancelled } from '../../lib/prompt'
import { stakingTokenAddresses } from '@airswap/constants'
import { getTable } from 'console.table'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const Registry = require('@airswap/registry/build/contracts/Registry.sol/Registry.json')
const registryDeploys = require('@airswap/registry/deploys.js')

export default class RegistryAdd extends Command {
  static description = 'add supported tokens to the registry'
  async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, RegistryAdd.description, chainId)

      const registryAddress = registryDeploys[chainId]
      const registryContract = new ethers.Contract(registryAddress, Registry.abi, wallet)
      this.log(chalk.white(`Registry ${registryAddress}`))

      const url = (await registryContract.getURLsForStakers([wallet.address]))[0]
      if (!url) {
        this.log(chalk.yellow('\nServer URL is not set'))
        this.log(`Set your server URL with ${chalk.bold('registry:url')}\n`)
      } else {
        this.log(chalk.white(`Server URL ${chalk.bold(url)}\n`))
      }

      const alreadySupported = await registryContract.getSupportedTokens(wallet.address)
      if (alreadySupported.length) {
        this.log(`Currently supporting the following tokens...\n`)
        const result = []
        alreadySupported.map(address => {
          const token = metadata.byAddress[address.toLowerCase()]
          result.push({
            Symbol: token.symbol,
            Address: token.address,
          })
        })
        this.log(getTable(result))
      }

      const stakingTokenContract = new ethers.Contract(stakingTokenAddresses[chainId], IERC20.abi, wallet)
      const allowance = await stakingTokenContract.allowance(wallet.address, registryAddress)

      if (allowance.eq(0)) {
        this.log(chalk.yellow('Registry not enabled'))
        this.log(`Enable staking on the Registry with ${chalk.bold('registry:enable')}\n`)
      } else {
        const tokens: any = await getTokenList(metadata, 'tokens to add (comma separated)')
        const tokenAddresses = []
        const tokenLabels = []

        for (const i in tokens) {
          tokenAddresses.push(tokens[i].address)
          tokenLabels.push(`${tokens[i].address} (${tokens[i].symbol})`)
        }

        const tokenCost = (await registryContract.tokenCost()).toNumber()
        const obligationCost = (await registryContract.obligationCost()).toNumber()

        let totalCost = 0
        if ((await registryContract.balanceOf(wallet.address)).eq(0)) {
          totalCost = obligationCost
        }
        totalCost += tokenCost * tokenAddresses.length

        if (
          await confirm(
            this,
            metadata,
            'addTokens',
            {
              tokens: tokenLabels.join('\n'),
              stake: `${totalCost / 10000} AST`,
            },
            chainId,
          )
        ) {
          registryContract
            .addTokens(tokenAddresses, { gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
