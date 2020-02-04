import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'

export default class MetadataUpdate extends Command {
  static description = 'update local metadata'
  async run() {
    const provider = await utils.getProvider(this)
    const chainId = (await provider.getNetwork()).chainId
    utils.displayDescription(this, MetadataUpdate.description, chainId)

    await utils.updateMetadata(this, chainId)
  }
}
