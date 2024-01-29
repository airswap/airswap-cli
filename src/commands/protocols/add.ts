import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { getTable } from 'console.table'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { confirm, cancelled, getProtocolList } from '../../lib/prompt'

import {
  Protocols,
  protocolNames,
  stakingTokenAddresses,
} from '@airswap/utils'
import { Registry } from '@airswap/libraries'

const IERC20 = require('@openzeppelin/contracts/build/contracts/IERC20.json')

export default class ProtocolsAdd extends Command {
  public static description = 'add supported protocols to the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, ProtocolsAdd.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)
      const url = (
        await registryContract.getServerURLsForStakers([wallet.address])
      )[0]
      if (!url) {
        this.log(chalk.yellow('\nServer URL is not set'))
        this.log(`Set your server URL with ${chalk.bold('registry:url')}\n`)
      } else {
        this.log(chalk.white(`Server URL ${chalk.bold(url)}\n`))
      }

      const alreadySupported = await registryContract.getProtocolsForStaker(
        wallet.address
      )
      if (alreadySupported.length) {
        this.log(`Your activated protocols:\n`)
        const result = []
        alreadySupported.map((interfaceId) => {
          result.push({
            ID: interfaceId,
            Name: protocolNames[interfaceId],
          })
        })
        this.log(getTable(result))
      }

      const stakingTokenContract = new ethers.Contract(
        stakingTokenAddresses[chainId],
        IERC20.abi,
        wallet
      )
      const allowance = await stakingTokenContract.allowance(
        wallet.address,
        Registry.getAddress(chainId)
      )

      if (allowance.eq(0)) {
        this.log(chalk.yellow('Registry not enabled'))
        this.log(
          `Enable staking on the Registry with ${chalk.bold(
            'registry:approve'
          )}\n`
        )
      } else {
        this.log(`All available protocols:\n`)

        const result = []
        for (const protocol in Protocols) {
          result.push({
            ID: Protocols[protocol],
            Name: protocol,
          })
        }
        this.log(getTable(result))

        const protocols: any = await getProtocolList(
          protocolNames,
          'protocols to activate (comma separated)'
        )
        const protocolIds = []
        const protocolLabels = []

        for (const interfaceId in protocols) {
          protocolIds.push(interfaceId)
          protocolLabels.push(`${interfaceId} (${protocols[interfaceId]})`)
        }

        const supportCost = (await registryContract.supportCost()).toNumber()
        const totalCost = supportCost * protocolIds.length

        this.log()
        if (
          await confirm(
            this,
            metadata,
            'addProtocols',
            {
              protocols: protocolLabels.join('\n'),
              stake: `${totalCost / 10000} AST`,
            },
            chainId
          )
        ) {
          registryContract
            .addProtocols(protocolIds, { gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
