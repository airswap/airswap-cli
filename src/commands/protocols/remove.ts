import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, confirm, cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'
import { Registry } from '@airswap/libraries'
import { protocolNames } from '@airswap/utils'
const IERC20 = require('@openzeppelin/contracts/build/contracts/IERC20.json')

export default class ProtocolsRemove extends Command {
  public static description = 'remove supported protocols from the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, ProtocolsRemove.description, chainId)

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
        this.log(`Protocols currently activated:\n`)
        const result = []
        alreadySupported.map((id) => {
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
        process.exit(0)
      }

      const stakingTokenContract = new ethers.Contract(
        await registryContract.stakingToken(),
        IERC20.abi,
        wallet
      )

      const { protocolId }: any = await get({
        protocolId: {
          type: 'Protocol',
          description: 'protocol to deactivate',
        },
      })
      this.log()

      const stakingToken =
        metadata.byAddress[stakingTokenContract.address.toLowerCase()]
      const supportCost = (await registryContract.supportCost()).toNumber()

      if (
        await confirm(
          this,
          metadata,
          'removeProtocols',
          {
            protocols: `${protocolId} (${protocolNames[protocolId]})`,
            unstake: `${ethers.utils
              .formatUnits(supportCost.toString(), stakingToken.decimals)
              .toString()} ${stakingToken.symbol}`,
          },
          chainId
        )
      ) {
        registryContract
          .removeProtocols([protocolId])
          .then(utils.handleTransaction)
          .catch(utils.handleError)
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
