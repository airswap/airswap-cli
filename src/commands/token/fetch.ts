import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'

export default class TokenFetch extends Command {
  static description = 'update local metadata'
  async run() {
    const provider = await utils.getProvider(this)
    const chainId = (await provider.getNetwork()).chainId
    utils.displayDescription(this, TokenFetch.description, chainId)

    await utils.updateMetadata(this)
  }
}
