import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'

export default class OrderGet extends Command {
  static description = 'get an order from a peer'
  async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
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
        } else {
          try {
            await requests.validateResponse(order, request.method, request.params, wallet)
            utils.handleResponse(request, wallet, metadata, chainId, gasPrice, this, order)
          } catch (e) {
            cancelled(e)
          }
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
