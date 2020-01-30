import { ethers } from 'ethers'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { printObject, printOrder, confirm } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import BigNumber from 'bignumber.js'

const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')

export default class OrderBest extends Command {
  static description = 'get the best available order'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, OrderBest.description, chainId)

    const request = await requests.getRequest(wallet, metadata, 'Order')

    this.log()
    printObject(this, metadata, `Request: ${request.method}`, request.params)

    requests.multiPeerCall(
      wallet,
      request.method,
      request.params,
      async (order: any, locator: string, errors: Array<any>) => {
        this.log()

        if (!order) {
          this.log(chalk.yellow('\nNo valid results found.\n'))
        } else {
          printOrder(this, request.side, request.signerToken, request.senderToken, locator, order)

          this.log(`Expiry ${chalk.green(new Date(order.expiry * 1000).toLocaleTimeString())}\n`)

          if (
            await confirm(
              this,
              metadata,
              'swap',
              {
                signerWallet: order.signer.wallet,
                signerToken: order.signer.token,
                signerAmount: `${order.signer.amount} (${new BigNumber(order.signer.amount)
                  .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                  .toFixed()})`,
                senderWallet: `${order.sender.wallet} (You)`,
                senderToken: order.sender.token,
                senderAmount: `${order.sender.amount} (${new BigNumber(order.sender.amount)
                  .dividedBy(new BigNumber(10).pow(request.senderToken.decimals))
                  .toFixed()})`,
              },
              chainId,
            )
          ) {
            const swapAddress = swapDeploys[chainId]
            new ethers.Contract(swapAddress, Swap.abi, wallet)
              .swap(order)
              .then(utils.handleTransaction)
              .catch(utils.handleError)
          }
        }
      },
    )
  }
}
