import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'

export default class OrderBest extends Command {
  static description = 'get the best available order'
  async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const protocol = await utils.getProtocol(this)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, OrderBest.description, chainId)

      const request = await requests.getRequest(wallet, metadata, 'Order')
      this.log()

      if (request.format === 'light') {
        requests.multiPeerCall(
          wallet,
          request.method,
          request.params,
          protocol,
          (order: any) => {
            utils.handleLightResponse(request, wallet, metadata, chainId, gasPrice, this, order)
          },
          true,
        )
      } else {
        requests.multiPeerCall(wallet, request.method, request.params, protocol, (order: any) => {
          utils.handleFullResponse(request, wallet, metadata, chainId, gasPrice, this, order)
        })
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
