import { Command } from '@oclif/command'
import { updateMetadata } from '../../utils'
import { intro } from '../../setup'

export default class TokensUpdate extends Command {
  static description = 'update local metadata'
  async run() {
    intro(this, TokensUpdate.description)
    await updateMetadata(this)
  }
}
