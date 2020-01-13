import { Command } from '@oclif/command'
import setup from '../../setup'
import { getBest } from '../../utils'

export default class QuotesBest extends Command {
  static description = 'Get a best quote'
  async run() {
    setup(this, QuotesBest.description, async (wallet: any, metadata: any) => {
      getBest(this, 'Quote', metadata, wallet, (request: any, order: any) => {
        this.log('\n')
        process.exit(0)
      })
    })
  }
}
