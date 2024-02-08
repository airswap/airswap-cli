import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, confirm, cancelled } from '../../lib/prompt'

import { Registry } from '@airswap/libraries'
const IERC20 = require('@openzeppelin/contracts/build/contracts/IERC20.json')

export default class RegistryURL extends Command {
  public static description = 'set server url on the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, RegistryURL.description, chainId)

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
        this.log(chalk.yellow('Registry not enabled'))
        this.log(
          `Enable staking on the Registry with ${chalk.bold(
            'registry:approve'
          )}\n`
        )
      } else {
        const url = (
          await registryContract.getServerURLsForStakers([wallet.address])
        )[0]

        const stakingToken =
          metadata.byAddress[stakingTokenContract.address.toLowerCase()]
        const stakingCost = await registryContract.stakingCost()

        if (url) {
          this.log(`Current server url: ${url}\n`)
        } else {
          const balance = await stakingTokenContract.balanceOf(wallet.address)
          if (balance.lt(stakingCost)) {
            this.log(
              `Insufficient balance in staking token (${stakingTokenContract.address})\n`
            )
            this.log(
              `· Balance: ${ethers.utils
                .formatUnits(balance.toString(), stakingToken.decimals)
                .toString()}`
            )
            this.log(
              `· Required: ${ethers.utils
                .formatUnits(stakingCost.toString(), stakingToken.decimals)
                .toString()}\n`
            )
          } else {
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
                .setServerURL(newURL)
                .then(utils.handleTransaction)
                .catch(utils.handleError)
            }
          }
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
