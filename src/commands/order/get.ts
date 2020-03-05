import { ethers } from 'ethers'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, printOrder, confirm, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import { isValidOrder } from '@airswap/utils'
import { Validator } from '@airswap/protocols'
import BigNumber from 'bignumber.js'
const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class OrderGet extends Command {
  static description = 'get an order from a peer'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, OrderGet.description, chainId)

      const { locator }: any = await get({
        locator: {
          type: 'Locator',
        },
      })
      const request = await requests.getRequest(wallet, metadata, 'Order')
      this.log()

      requests.peerCall(locator, request.method, request.params, async (err, order) => {
        if (err) {
          if (err === 'timeout') {
            this.log(chalk.yellow('The request timed out.\n'))
          } else {
            this.log(err)
            this.log()
          }
          process.exit(0)
        } else if (isValidOrder(order)) {
          this.log(chalk.underline.bold(`Signer: ${order.signer.wallet}\n`))
          await printOrder(this, request, order, wallet, metadata)
          const errors = await new Validator(chainId).checkSwap(order)

          if (errors.length) {
            this.log(chalk.yellow('Unable to take (as sender) for the following reasons.\n'))
            for (const e in errors) {
              this.log(`‣ ${Validator.getReason(errors[e])}`)
            }
            this.log()
          } else {
            if (
              await confirm(
                this,
                metadata,
                'swap',
                {
                  signerWallet: order.signer.wallet,
                  signerToken: order.signer.token,
                  signerAmount: `${order.signer.amount} (${chalk.cyan(
                    new BigNumber(order.signer.amount)
                      .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                      .toFixed(),
                  )})`,
                  senderWallet: `${order.sender.wallet} (${chalk.cyan('You')})`,
                  senderToken: order.sender.token,
                  senderAmount: `${order.sender.amount} (${chalk.cyan(
                    new BigNumber(order.sender.amount)
                      .dividedBy(new BigNumber(10).pow(request.senderToken.decimals))
                      .toFixed(),
                  )})`,
                },
                chainId,
                'take this order',
              )
            ) {
              new ethers.Contract(swapDeploys[chainId], Swap.abi, wallet)
                .swap(order, { gasPrice })
                .then(utils.handleTransaction)
                .catch(utils.handleError)
            }
          }
        } else {
          this.log(chalk.yellow('Received an invalid or improperly signed order.\n'))
          this.log(order)
          this.log()
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
