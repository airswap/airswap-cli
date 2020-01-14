import chalk from 'chalk'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import { getWallet, getMetadata, displayDescription } from '../../lib/utils'
import { getRequest } from '../../lib/utils'

import { peerCall, printOrder, printObject } from '../../lib/utils'
import { orders } from '@airswap/order-utils'

export default class QuotesGet extends Command {
  static description = 'get a quote from a peer'
  async run() {
    const wallet = await getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await getMetadata(this, chainId)
    displayDescription(this, QuotesGet.description, chainId)

    const request = await getRequest(wallet, metadata, 'Quote')
    const locator = await cli.prompt('locator', { default: 'http://localhost:3000' })

    this.log()
    printObject(this, metadata, `Request: ${request.method}`, request.params)

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
  }
}
