import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getTokens, confirm } from '../../lib/prompt'
import constants from '../../lib/constants.json'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class TokenApprove extends Command {
  static description = 'approve a token for trading'
  async run() {
    const wallet = await utils.getWallet(this, true)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, TokenApprove.description, chainId)

    const swapAddress = swapDeploys[chainId]
    const { token }: any = await getTokens({ token: 'token' }, metadata)
    this.log()

    const tokenContract = new ethers.Contract(token.addr, IERC20.abi, wallet)
    const allowance = await tokenContract.allowance(wallet.address, swapAddress)

    if (!allowance.eq(0)) {
      this.log(chalk.yellow(`${token.name} is already approved`))
      this.log(`Trading is enabled for this token.\n`)
    } else {
      if (
        await confirm(
          this,
          metadata,
          'approve',
          {
            token: `${token.addr} (${token.name})`,
            spender: `${swapAddress} (Swap)`,
          },
          chainId,
        )
      ) {
        tokenContract
          .approve(swapAddress, constants.APPROVAL_AMOUNT)
          .then(utils.handleTransaction)
          .catch(utils.handleError)
      }
    }
  }
}
