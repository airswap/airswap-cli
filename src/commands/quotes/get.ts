import chalk from 'chalk'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import setup from '../../setup'
import { getRequest } from '../../utils'

import { peerCall, printOrder, printObject, confirmTransaction } from '../../utils'
import { orders } from '@airswap/order-utils'

export default class QuoteGet extends Command {
  static description = 'Get an order'
  async run() {
    setup(this, QuoteGet.description, async (wallet: any, metadata: any) => {
      const request = await getRequest(wallet, metadata, 'Quote')
      const locator = await cli.prompt('locator', { default: 'http://localhost:3000' })

      this.log()
      printObject(this, `Request: ${request.method}`, request.params)

      peerCall(locator, request.method, request.params, (err: any, quote: any) => {
        if (quote) {
          if (!orders.isValidQuote(quote)) {
            this.log(chalk.yellow('Quote has invalid params'))
          } else {
            printOrder(this, request.side, request.signerToken, request.senderToken, locator, quote)
            this.log()
          }
        }
        if (err) {
          if (err === 'timeout') {
            this.log(chalk.yellow('The request timed out.\n'))
          } else {
            this.log(err)
            this.log()
          }
        }
        process.exit(0)
      })
    })
  }
}
