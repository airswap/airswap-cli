import { Command } from '@oclif/command'
import * as utils from '../lib/utils'
import { getWallet } from '../lib/wallet'
import { cancelled } from '../lib/prompt'
import * as requests from '../lib/requests'

export default class Best extends Command {
  public static description = 'compare order pricing from servers'
  public async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, Best.description, chainId)

      const request = await requests.getRequest(wallet, metadata, 'Order')
      this.log()

      requests.multiPeerCall(
        wallet,
        request.method,
        request.params,
        request.senderToken.address,
        request.signerToken.address,
        (order: any, results: any, errors: any) => {
          utils.handleResponse(
            request,
            wallet,
            metadata,
            chainId,
            gasPrice,
            this,
            order,
            errors
          )
        }
      )
    } catch (e) {
      cancelled(e)
    }
  }
}
