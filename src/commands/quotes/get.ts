import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'

export default class QuotesGet extends Command {
  static description = 'get a quote from a peer'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    utils.displayDescription(this, QuotesGet.description, chainId)
  }
}
