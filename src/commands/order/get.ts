import { ethers } from 'ethers'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, printObject, printOrder, confirm } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import BigNumber from 'bignumber.js'
import { orders } from '@airswap/order-utils'
const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class OrderGet extends Command {
  static description = 'get an order from a peer'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, OrderGet.description, chainId)

    try {
      const request = await requests.getRequest(wallet, metadata, 'Order')

      let { locator }: any = await get({
        locator: {
          type: 'URL',
        },
      })

      this.log()
      printObject(this, metadata, `Request: ${request.method}`, request.params)

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
          printOrder(this, request.side, request.signerToken, request.senderToken, locator, order)
          this.log(`Expiry ${chalk.green(new Date(order.expiry * 1000).toLocaleTimeString())}\n`)

          const swapAddress = swapDeploys[chainId]

          if (!orders.isValidOrder(order)) {
            this.log(chalk.yellow('Order has invalid params or signature'))
          } else if (
            order.signer.token !== request.signerToken.addr ||
            order.sender.token !== request.senderToken.addr
          ) {
            this.log(chalk.yellow('Order tokens do not match those requested'))
          } else if (
            order.signature.validator &&
            order.signature.validator.toLowerCase() !== swapAddress.toLowerCase()
          ) {
            this.log(chalk.yellow('Order is intended for another swap contract'))
          } else {
            if (
              await confirm(
                this,
                metadata,
                'swap',
                {
                  signerWallet: `${order.signer.wallet}`,
                  signerToken: `${order.signer.token} (${request.signerToken.name})`,
                  signerAmount: `${order.signer.amount} (${new BigNumber(order.signer.amount)
                    .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                    .toFixed()})`,
                  senderWallet: `${order.sender.wallet} (You)`,
                  senderToken: `${order.sender.token} (${request.senderToken.name})`,
                  senderAmount: `${order.sender.amount} (${new BigNumber(order.sender.amount)
                    .dividedBy(new BigNumber(10).pow(request.senderToken.decimals))
                    .toFixed()})`,
                },
                chainId,
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
      this.log('\n\nCancelled.\n')
    }
  }
}
