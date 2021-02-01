import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, getTokens, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import chalk from 'chalk'
import { toDecimalString } from '@airswap/utils'
export default class QuoteMax extends Command {
  static description = 'get a max quote from a peer'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
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
        params.signerToken = first.address
        params.senderToken = second.address
      } else {
        params.signerToken = second.address
        params.senderToken = first.address
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
            maxAmount = toDecimalString(order.signer.amount, metadata.byAddress[order.signer.token].decimals)
            maxFor = toDecimalString(order.sender.amount, metadata.byAddress[order.sender.token].decimals)
          } else {
            maxAmount = toDecimalString(order.sender.amount, metadata.byAddress[order.sender.token].decimals)
            maxFor = toDecimalString(order.signer.amount, metadata.byAddress[order.signer.token].decimals)
          }
          this.log(chalk.underline.bold(`Response: ${locator}`))
          let verb = 'Buying'
          if (side === 'buy') {
            verb = 'Selling'
          }
          this.log(
            `\n${verb} up to ${chalk.bold(maxAmount)} ${chalk.bold(first.symbol)} for ${chalk.bold(
              maxFor,
            )} ${chalk.bold(second.symbol)}\n`,
          )
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
