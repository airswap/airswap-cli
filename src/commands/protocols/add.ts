import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { getTable } from 'console.table'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, confirm, cancelled } from '../../lib/prompt'
import { Registry } from '@airswap/libraries'
import { ProtocolIds, protocolNames } from '@airswap/utils'
const IERC20 = require('@airswap/utils/build/src/abis/ERC20.json')

export default class ProtocolsAdd extends Command {
  public static description = 'add supported protocols to the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, ProtocolsAdd.description, chainId)

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

      if (allowance.eq(0)) {
        this.log(chalk.yellow('Registry is not approved'))
        this.log(
          `Enable usage of the registry with ${chalk.bold(
            'registry:approve'
          )}\n`
        )
        process.exit(0)
      }

      const url = (
        await registryContract.getServerURLsForStakers([wallet.address])
      )[0]
      if (!url) {
        this.log(chalk.yellow('Server URL is not set'))
        this.log(`Set your server URL with ${chalk.bold('registry:url')}\n`)
        process.exit(0)
      } else {
        this.log(chalk.white(`Server URL ${chalk.bold(url)}\n`))
      }

      const activatedProtocols = await registryContract.getProtocolsForStaker(
        wallet.address
      )
      if (activatedProtocols.length) {
        this.log(`Protocols currently activated:\n`)
        const result = []
        activatedProtocols.map((id) => {
          result.push({
            id,
            label: protocolNames[id],
          })
        })
        this.log(getTable(result))
      } else {
        this.log(`No protocols are currently activated.\n`)
      }

      this.log(
        `${chalk.bold(
          'Available protocols'
        )} (More info: https://about.airswap.io/technology/protocols)\n`
      )

      for (const i in ProtocolIds) {
        this.log(`· ${ProtocolIds[i]} (${i})`)
      }

      this.log()
      const { protocolId }: any = await get({
        protocolId: {
          type: 'Protocol',
          description: 'protocol id to activate',
        },
      })
      this.log()

      const stakingToken =
        metadata.byAddress[stakingTokenContract.address.toLowerCase()]
      const supportCost = await registryContract.supportCost()
      const balance = await stakingTokenContract.balanceOf(wallet.address)
      if (balance.lt(supportCost)) {
        this.log(
          `Insufficient balance in staking token ${stakingToken.symbol} (${stakingToken.address})\n`
        )
        this.log(
          `· Balance: ${ethers.utils
            .formatUnits(balance.toString(), stakingToken.decimals)
            .toString()}`
        )
        this.log(
          `· Required: ${ethers.utils
            .formatUnits(supportCost.toString(), stakingToken.decimals)
            .toString()}\n`
        )
      } else {
        if (
          await confirm(
            this,
            metadata,
            'addProtocols',
            {
              protocols: `${protocolId} (${protocolNames[protocolId]})`,
              stake: `${ethers.utils
                .formatUnits(supportCost.toString(), stakingToken.decimals)
                .toString()} ${stakingToken.symbol}`,
            },
            chainId
          )
        ) {
          registryContract
            .addProtocols([protocolId])
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
