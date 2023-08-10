import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { confirm, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'

import { stakingTokenAddresses } from '@airswap/constants'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const registryDeploys = require('@airswap/maker-registry/deploys.js')

export default class RegistryEnable extends Command {
  public static description = 'enable staking on the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, RegistryEnable.description, chainId)

      const registryAddress = registryDeploys[chainId]
      const stakingTokenContract = new ethers.Contract(
        stakingTokenAddresses[chainId],
        IERC20.abi,
        wallet
      )
      const allowance = await stakingTokenContract.allowance(
        wallet.address,
        registryAddress
      )

      if (!allowance.eq(0)) {
        this.log(chalk.yellow('Registry already enabled'))
        this.log(
          `Add tokens to the Registry with ${chalk.bold('registry:add')}\n`
        )
      } else {
        if (
          await confirm(
            this,
            metadata,
            'approve',
            {
              token: `${stakingTokenAddresses[chainId]} (AST)`,
              spender: `${registryAddress} (Registry)`,
            },
            chainId
          )
        ) {
          stakingTokenContract
            .approve(registryAddress, constants.MAX_APPROVAL_AMOUNT, {
              gasPrice,
            })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
