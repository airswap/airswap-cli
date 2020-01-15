import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'

export default class QuotesBest extends Command {
  static description = 'get the best available quote'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, QuotesBest.description, chainId)

    utils.getBest(this, 'Quote', metadata, wallet, async (request: any, order: any) => {
      this.log()
    })
  }
}
