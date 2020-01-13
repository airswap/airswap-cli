import { Command } from '@oclif/command'
import { updateMetadata } from '../../utils'

export default class GetMetadata extends Command {
  static description = 'Update local metadata'
  async run() {
    await updateMetadata(this)
  }
}
