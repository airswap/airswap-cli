import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../lib/utils'
import { getWallet } from '../lib/wallet'
import { get, cancelled } from '../lib/prompt'
import * as requests from '../lib/requests'

export default class Inspect extends Command {
  static description = 'inspect protocols for a server'
  async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, Inspect.description, chainId)

      const { locator }: any = await get({
        locator: {
          type: 'Locator',
        },
      })
      const request = await requests.getRequest(wallet, metadata, 'Order')
      this.log()

      requests.peerCall(locator, 'getProtocols', {}, async (err, res) => {
        this.log(res)
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
