import chalk from 'chalk'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import { ethers } from 'ethers'
import { promptToken, confirmTransaction, handleTransaction, handleError } from '../../utils'
import setup from '../../setup'

const constants = require('../../constants.json')
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class TokensApprove extends Command {
  static description = 'approve a token for trading'
  async run() {
    setup(this, TokensApprove.description, async (wallet: any, metadata: any) => {
      const swapAddress = swapDeploys[wallet.provider.network.chainId]
      const token = await promptToken(metadata, 'token')
      this.log()

      new ethers.Contract(token.addr, IERC20.abi, wallet)
        .allowance(wallet.address, swapAddress)
        .then(async (allowance: any) => {
          if (!allowance.eq(0)) {
            this.log(chalk.yellow(`${token.name} is already approved`))
            this.log(`Trading is enabled for this token.\n`)
          } else {
            confirmTransaction(
              this,
              'approve',
              {
                token: `${token.addr} (${token.name})`,
                spender: `${swapAddress} (Swap)`,
              },
              () => {
                new ethers.Contract(token.addr, IERC20.abi, wallet)
                  .approve(swapAddress, constants.APPROVAL_AMOUNT)
                  .then(handleTransaction)
                  .catch(handleError)
              },
            )
          }
        })
    })
  }
}
