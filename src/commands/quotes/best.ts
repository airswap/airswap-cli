import { Command } from '@oclif/command'
import { getWallet, getMetadata, displayDescription, getBest } from '../../lib/utils'

export default class QuotesBest extends Command {
  static description = 'get the best available order'
  async run() {
    const wallet = await getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await getMetadata(this, chainId)
    displayDescription(this, QuotesBest.description, chainId)

    getBest(this, 'Quote', metadata, wallet, (request: any, order: any) => {
      this.log('\n')
      process.exit(0)
    })
  }
}
