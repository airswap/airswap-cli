import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { printObject, printOrder } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import chalk from 'chalk'

export default class QuotesBest extends Command {
  static description = 'get the best available quote'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, QuotesBest.description, chainId)

    try {
      const request = await requests.getRequest(wallet, metadata, 'Quote')
      this.log()
      printObject(this, metadata, `Request: ${request.method}`, request.params)
      requests.multiPeerCall(
        wallet,
        request.method,
        request.params,
        (quote: any, locator: string, errors: Array<any>) => {
          this.log()
          if (!quote) {
            this.log(chalk.yellow('\nNo valid results found.\n'))
          } else {
            printOrder(this, request.side, request.signerToken, request.senderToken, locator, quote)
            this.log()
          }
        },
      )
    } catch (e) {
      this.log('\n\nCancelled.\n')
    }
  }
}
