import { ethers } from 'ethers'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import setup from '../../setup'
import { handleTransaction, handleError, getRequest } from '../../utils'

import { peerCall, printOrder, printObject, confirmTransaction } from '../../utils'
import BigNumber from 'bignumber.js'
import { orders } from '@airswap/order-utils'
const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class OrdersBuy extends Command {
  static description = 'get an order from a locator'
  async run() {
    setup(this, 'Get an order', async (wallet: any, metadata: any) => {
      const request = await getRequest(wallet, metadata, 'Order')
      const locator = await cli.prompt('locator', { default: 'http://localhost:3000' })

      this.log()
      printObject(this, `Request: ${request.method}`, request.params)

      peerCall(locator, request.method, request.params, (err: any, order: any) => {
        if (order) {
          printOrder(this, request.side, request.signerToken, request.senderToken, locator, order)
          this.log(`Expiry ${chalk.green(new Date(order.expiry * 1000).toLocaleTimeString())}\n`)

          const swapAddress = swapDeploys[wallet.provider.network.chainId]

          if (!orders.isValidOrder(order)) {
            this.log(chalk.yellow('Order has invalid params or signature'))
          } else if (
            order.signer.token !== request.signerToken.addr ||
            order.sender.token !== request.senderToken.addr
          ) {
            this.log(chalk.yellow('Order tokens do not match those requested'))
          } else if (order.signature.validator.toLowerCase() !== swapAddress.toLowerCase()) {
            this.log(chalk.yellow('Order is intended for another swap contract'))
          } else {
            confirmTransaction(
              this,
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
              () => {
                new ethers.Contract(swapAddress, Swap.abi, wallet)
                  .swap(order)
                  .then(handleTransaction)
                  .catch(handleError)
              },
            )
          }
        }
        if (err) {
          if (err === 'timeout') {
            this.log(chalk.yellow('The request timed out.\n'))
          } else {
            this.log(err)
            this.log()
          }
          process.exit(0)
        }
      })
    })
  }
}
