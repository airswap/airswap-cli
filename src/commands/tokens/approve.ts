import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import {
  promptToken,
  handleTransaction,
  handleError,
  getWallet,
  getMetadata,
  displayDescription,
  confirmTransaction,
} from '../../lib/utils'

const constants = require('../../lib/constants.json')
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class TokensApprove extends Command {
  static description = 'approve a token for trading'
  async run() {
    const wallet = await getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await getMetadata(this, chainId)
    displayDescription(this, TokensApprove.description, chainId)

    const swapAddress = swapDeploys[chainId]
    const token = await promptToken(metadata, 'token')
    this.log()

    new ethers.Contract(token.addr, IERC20.abi, wallet)
      .allowance(wallet.address, swapAddress)
      .then(async (allowance: any) => {
        if (!allowance.eq(0)) {
          this.log(chalk.yellow(`${token.name} is already approved`))
          this.log(`Trading is enabled for this token.\n`)
        } else {
          if (
            await confirmTransaction(this, metadata, 'approve', {
              token: `${token.addr} (${token.name})`,
              spender: `${swapAddress} (Swap)`,
            })
          ) {
            new ethers.Contract(token.addr, IERC20.abi, wallet)
              .approve(swapAddress, constants.APPROVAL_AMOUNT)
              .then(handleTransaction)
              .catch(handleError)
          }
        }
      })
  }
}
