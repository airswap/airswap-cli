import chalk from 'chalk'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import { getWallet, getMetadata, displayDescription } from '../../lib/utils'
import * as utils from '../../lib/utils'
import { orders } from '@airswap/order-utils'

export default class QuotesGet extends Command {
  static description = 'get a quote from a peer'
  async run() {
    const wallet = await getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await getMetadata(this, chainId)
    displayDescription(this, QuotesGet.description, chainId)
  }
}
