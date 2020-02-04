import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, confirm, cancelled, getTokens } from '../../lib/prompt'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')

export default class TokenTransfer extends Command {
  static description = 'transfer tokens to another account'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, TokenTransfer.description, chainId)

      const { token }: any = await getTokens({ token: 'token' }, metadata)
      const { amount, recipient }: any = await get({
        amount: {
          description: 'amount',
          type: 'Number',
        },
        recipient: {
          description: 'recipient',
          type: 'Address',
        },
      })

      const atomicAmount = utils.getAtomicValue(amount, token.addr, metadata)
      const tokenContract = new ethers.Contract(token.addr, IERC20.abi, wallet)
      const tokenBalance = await tokenContract.balanceOf(wallet.address)

      if (tokenBalance.lt(atomicAmount.toString())) {
        cancelled('Insufficient balance.')
      } else {
        this.log()
        if (
          await confirm(
            this,
            metadata,
            'transfer',
            {
              to: recipient,
              value: `${atomicAmount} (${chalk.cyan(amount)})`,
            },
            chainId,
          )
        ) {
          tokenContract
            .transfer(recipient, atomicAmount.toFixed())
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
