import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, printOrder, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import chalk from 'chalk'
import { isValidQuote } from '@airswap/utils'

export default class QuoteGet extends Command {
  static description = 'get a quote from a peer'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, QuoteGet.description, chainId)

      const { locator }: any = await get({
        locator: {
          type: 'Locator',
        },
      })

      const request = await requests.getRequest(wallet, metadata, 'Quote')

      this.log()

      requests.peerCall(locator, request.method, request.params, async (err, quote) => {
        if (err) {
          if (err === 'timeout') {
            this.log(chalk.yellow('The request timed out.\n'))
          } else {
            this.log(err)
            this.log()
          }
          process.exit(0)
        } else if (quote) {
          if (isValidQuote(quote)) {
            await printOrder(this, request, locator, quote, wallet, metadata)
          } else {
            this.log(chalk.yellow('Received an invalid quote.\n'))
            this.log(quote)
            this.log()
          }
        } else {
          this.log('No valid response received.\n')
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
