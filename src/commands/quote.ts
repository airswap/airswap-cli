import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../lib/utils'
import { getWallet } from '../lib/wallet'
import { get, cancelled } from '../lib/prompt'
import * as requests from '../lib/requests'

export default class Order extends Command {
  public static description = 'get an order from a server'
  public async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      utils.displayDescription(this, Order.description, chainId)

      const { locator }: any = await get({
        locator: {
          type: 'Locator',
        },
      })
      this.log()

      requests.peerCall(locator, 'getPricingERC20', {}, async (err, order) => {
        console.log(order)
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
