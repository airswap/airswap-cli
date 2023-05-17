import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'

export default class MetadataUpdate extends Command {
  static description = 'update local metadata from remote sources'
  async run() {
    const { chainId } = await utils.getConfig(this)
    utils.displayDescription(this, MetadataUpdate.description, chainId)

    await utils.updateMetadata(this, chainId)
  }
}
