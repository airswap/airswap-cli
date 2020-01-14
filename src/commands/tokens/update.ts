import { Command } from '@oclif/command'
import { updateMetadata, getWallet, getMetadata, displayDescription } from '../../lib/utils'

export default class TokensUpdate extends Command {
  static description = 'update local metadata'
  async run() {
    const wallet = await getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await getMetadata(this, chainId)
    displayDescription(this, TokensUpdate.description, chainId)

    await updateMetadata(this)
  }
}
