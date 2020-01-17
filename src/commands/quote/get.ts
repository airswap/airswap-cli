import { cli } from 'cli-ux'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import * as prompts from '../../lib/prompts'
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

      const request = await requests.getRequest(wallet, metadata, 'Order')
      const locator = await cli.prompt('locator', { default: 'http://localhost:3000' })

      this.log()
      prompts.printObject(this, metadata, `Request: ${request.method}`, request.params)

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
          prompts.printOrder(this, request.side, request.signerToken, request.senderToken, locator, order)
        }
      })
    } catch (e) {
      this.log(chalk.yellow(e))
    }
  }
}
