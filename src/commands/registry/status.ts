import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'
import { Registry } from '@airswap/libraries'
import { protocolNames } from '@airswap/utils'

const IERC20 = require('@openzeppelin/contracts/build/contracts/IERC20.json')

export default class RegistryStatus extends Command {
  public static description =
    'check status of url, protocols, and tokens on registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, RegistryStatus.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)
      const stakingTokenContract = new ethers.Contract(
        await registryContract.stakingToken(),
        IERC20.abi,
        wallet
      )
      const allowance = await stakingTokenContract.allowance(
        wallet.address,
        Registry.getAddress(chainId)
      )
      if (allowance.gt(0)) {
        this.log('✅ Registry is approved for staking\n')
      } else {
        this.log(chalk.yellow('Registry is not approved'))
        this.log(
          `Enable usage of the registry with ${chalk.bold(
            'registry:approve'
          )}\n`
        )
      }

      const url = (
        await registryContract.getServerURLsForStakers([wallet.address])
      )[0]
      if (!url) {
        this.log(chalk.yellow('Server URL is not set'))
        this.log(`Set your server URL with ${chalk.bold('registry:url')}\n`)
      } else {
        this.log(chalk.white(`${chalk.bold('Server URL')}: ${url}\n`))
      }

      const activatedProtocols = await registryContract.getProtocolsForStaker(
        wallet.address
      )
      if (activatedProtocols.length) {
        this.log(`${chalk.bold('Protocols')} activated:\n`)
        const result = []
        activatedProtocols.map((id) => {
          result.push({
            id,
            label: protocolNames[id],
          })
        })
        this.log(getTable(result))
      } else {
        this.log(chalk.yellow('No activated protocols'))
        this.log(
          `Add protocols you support with ${chalk.bold('protocols:add')}\n`
        )
      }

      const supportedTokens = await registryContract.getTokensForStaker(
        wallet.address
      )
      if (supportedTokens.length) {
        this.log(`${chalk.bold('Tokens')} activated:\n`)
        const result = []
        supportedTokens.map((address) => {
          const token = metadata.byAddress[address.toLowerCase()]
          result.push({
            symbol: token.symbol,
            address: token.address,
          })
        })
        this.log(getTable(result))
      } else {
        this.log(chalk.yellow('No activated tokens'))
        this.log(`Add tokens you support with ${chalk.bold('tokens:add')}\n`)
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
