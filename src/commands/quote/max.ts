import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, getTokens, printObject, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import chalk from 'chalk'
import BigNumber from 'bignumber.js'

export default class QuotesGet extends Command {
  static description = 'get a max quote from a peer'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, QuotesGet.description, chainId)

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

      const { locator }: any = await get({
        locator: {
          type: 'URL',
        },
      })

      this.log()
      printObject(this, metadata, `Request: getMaxQuote`, params)

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
          if (side === 'buy') {
            maxAmount = new BigNumber(order.signer.amount)
              .dividedBy(new BigNumber(10).pow(metadata.byAddress[order.signer.token].decimals))
              .toFixed()
          } else {
            maxAmount = new BigNumber(order.sender.amount)
              .dividedBy(new BigNumber(10).pow(metadata.byAddress[order.sender.token].decimals))
              .toFixed()
          }
          this.log(chalk.underline.bold(`Response: ${locator}`))
          let verb = 'Buying'
          if (side === 'buy') {
            verb = 'Selling'
          }
          this.log(`\n${verb} up to ${chalk.bold(maxAmount)} ${chalk.bold(first.name)}\n`)
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
