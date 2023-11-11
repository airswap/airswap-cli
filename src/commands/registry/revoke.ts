import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { confirm, cancelled } from '../../lib/prompt'
import { REVOKE_AMOUNT } from '../../lib/constants.json'

import { stakingTokenAddresses } from '@airswap/constants'
import { Registry } from '@airswap/libraries'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')

export default class RegistryApprove extends Command {
  public static description = 'disable staking on the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, RegistryApprove.description, chainId)

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
        this.log(chalk.yellow('Registry already revoked'))
      } else {
        if (
          await confirm(
            this,
            metadata,
            'revoke',
            {
              token: `${stakingTokenAddresses[chainId]} (AST)`,
              spender: `${Registry.getAddress(chainId)} (Registry)`,
            },
            chainId
          )
        ) {
          stakingTokenContract
            .approve(Registry.getAddress(chainId), REVOKE_AMOUNT, {
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
