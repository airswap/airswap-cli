import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { printOrder, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import chalk from 'chalk'
import constants from '../../lib/constants.json'

export default class QuotesBest extends Command {
  static description = 'get the best available quote'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, QuotesBest.description, chainId)

      let { protocol } = await utils.getConfig(this)
      protocol = protocol || constants.protocols.HTTPS

      const request = await requests.getRequest(wallet, metadata, 'Quote')
      this.log()
      requests.multiPeerCall(wallet, request.method, request.params, protocol, async (quote: any, locator: string) => {
        this.log()
        if (!quote) {
          this.log(chalk.yellow('No valid responses received.\n'))
        } else {
          await printOrder(this, request, locator, quote, wallet, metadata)
          this.log()
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
