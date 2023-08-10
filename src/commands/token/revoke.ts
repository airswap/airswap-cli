import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, getTokens, confirm, cancelled } from '../../lib/prompt'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const swapDeploys = require('@airswap/swap-erc20/deploys.js')

export default class TokenRevoke extends Command {
  public static description = 'revoke a token approval'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, TokenRevoke.description, chainId)

      const { token }: any = await getTokens({ token: 'token' }, metadata)
      const { contract }: any = await get({
        contract: {
          description: 'swap contract',
          type: 'Address',
          default: swapDeploys[chainId],
        },
      })
      this.log()

      let swapAddress = contract
      if (!contract && swapDeploys[chainId]) {
        swapAddress = swapDeploys[chainId]
      }

      const tokenContract = new ethers.Contract(
        token.address,
        IERC20.abi,
        wallet
      )
      const allowance = await tokenContract.allowance(
        wallet.address,
        swapAddress
      )

      if (allowance.eq(0)) {
        this.log(
          chalk.yellow(
            `${token.symbol} is already revoked (swap contract: ${swapAddress})\n`
          )
        )
      } else {
        if (
          await confirm(
            this,
            metadata,
            'revoke',
            {
              token: `${token.address} (${token.symbol})`,
              spender: `${swapAddress} (Swap)`,
            },
            chainId
          )
        ) {
          tokenContract
            .approve(swapAddress, '0', { gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
