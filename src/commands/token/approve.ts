import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, getTokens, confirm, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const swapDeploys = require('@airswap/swap/deploys.json')
const lightDeploys = require('@airswap/light/deploys.json')

export default class TokenApprove extends Command {
  static description = 'approve a token for trading'
  async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, TokenApprove.description, chainId)

      const { format }: any = await get({
        format: {
          description: 'full or light',
          type: 'Format',
        },
      })

      let swapAddress = swapDeploys[chainId]
      if (format === 'light') {
        swapAddress = lightDeploys[chainId]
      }

      if (!swapAddress) {
        throw `No ${format} contract found for the current chain.`
      }

      const { token }: any = await getTokens({ token: 'token' }, metadata)
      this.log()

      const tokenContract = new ethers.Contract(token.address, IERC20.abi, wallet)
      const allowance = await tokenContract.allowance(wallet.address, swapAddress)

      if (!allowance.eq(0)) {
        this.log(chalk.yellow(`${token.symbol} is already approved for trading (swap contract: ${swapAddress})\n`))
      } else {
        if (
          await confirm(
            this,
            metadata,
            'approve',
            {
              token: `${token.address} (${token.symbol})`,
              spender: `${swapAddress} (Swap ${format})`,
            },
            chainId,
          )
        ) {
          tokenContract
            .approve(swapAddress, constants.APPROVAL_AMOUNT, { gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
