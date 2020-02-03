import { ethers } from 'ethers'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, printOrder, confirm, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import BigNumber from 'bignumber.js'
const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class OrderGet extends Command {
  static description = 'get an order from a peer'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, OrderGet.description, chainId)

      const request = await requests.getRequest(wallet, metadata, 'Order')
      const { locator }: any = await get({
        locator: {
          type: 'URL',
        },
      })
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
        } else {
          const swapAddress = swapDeploys[chainId]
          await printOrder(this, request, locator, order, wallet, metadata)
          const errors = await utils.verifyOrder(request, order, swapAddress, wallet, metadata)

          if (errors.length) {
            this.log(chalk.yellow('Unable to take this order.'))
            for (const e in errors) {
              this.log(`‣ ${errors[e]}`)
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
              new ethers.Contract(swapAddress, Swap.abi, wallet)
                .swap(order)
                .then(utils.handleTransaction)
                .catch(utils.handleError)
            }
          }
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
