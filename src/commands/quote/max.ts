import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, getTokens, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import chalk from 'chalk'
export default class QuoteMax extends Command {
  static description = 'get a max quote from a peer'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, QuoteMax.description, chainId)

      const { locator }: any = await get({
        locator: {
          type: 'Locator',
        },
      })

      const { side }: any = await get({
        side: {
          description: 'buy or sell',
          type: 'Side',
        },
      })

      const { first, second }: any = await getTokens({ first: 'token', second: 'for' }, metadata)

      const params: any = {}

      if (side === 'buy') {
        params.signerToken = first.addr
        params.senderToken = second.addr
      } else {
        params.signerToken = second.addr
        params.senderToken = first.addr
      }

      this.log()

      requests.peerCall(locator, 'getMaxQuote', params, async (err, order) => {
        if (err) {
          if (err === 'timeout') {
            this.log(chalk.yellow('The request timed out.\n'))
          } else {
            this.log(err)
            this.log()
          }
        } else {
          let maxAmount
          let maxFor
          if (side === 'buy') {
            maxAmount = utils.getDecimalValue(order.signer.amount, order.signer.token, metadata).toFixed()
            maxFor = utils.getDecimalValue(order.sender.amount, order.sender.token, metadata).toFixed()
          } else {
            maxAmount = utils.getDecimalValue(order.sender.amount, order.sender.token, metadata).toFixed()
            maxFor = utils.getDecimalValue(order.signer.amount, order.signer.token, metadata).toFixed()
          }
          this.log(chalk.underline.bold(`Response: ${locator}`))
          let verb = 'Buying'
          if (side === 'buy') {
            verb = 'Selling'
          }
          this.log(
            `\n${verb} up to ${chalk.bold(maxAmount)} ${chalk.bold(first.name)} for ${chalk.bold(maxFor)} ${chalk.bold(
              second.name,
            )}\n`,
          )
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
