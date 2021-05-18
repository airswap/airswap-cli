import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { printOrder, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import chalk from 'chalk'

export default class QuoteBest extends Command {
  static description = 'get the best available quote'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const protocol = await utils.getProtocol(this)
      utils.displayDescription(this, QuoteBest.description, chainId)

      const request = await requests.getRequest(wallet, metadata, 'Quote')
      this.log()
      requests.multiPeerCall(wallet, request.method, request.params, protocol, async (quote: any) => {
        this.log()
        if (!quote) {
          this.log(chalk.yellow('No valid responses received.\n'))
        } else {
          this.log(chalk.underline.bold(`Quote from ${quote.locator}\n`))
          await printOrder(this, request, quote, wallet, metadata)
          this.log()
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
