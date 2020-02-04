import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, printOrder, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import chalk from 'chalk'

export default class QuotesGet extends Command {
  static description = 'get a quote from a peer'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, QuotesGet.description, chainId)

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
        } else {
          await printOrder(this, request, locator, quote, wallet, metadata)
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
