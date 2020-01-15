import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'

export default class TokensUpdate extends Command {
  static description = 'update local metadata'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    utils.displayDescription(this, TokensUpdate.description, chainId)

    await utils.updateMetadata(this)
  }
}
