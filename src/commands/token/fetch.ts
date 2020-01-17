import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'

export default class TokenFetch extends Command {
  static description = 'update local metadata'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    utils.displayDescription(this, TokenFetch.description, chainId)

    await utils.updateMetadata(this)
  }
}
