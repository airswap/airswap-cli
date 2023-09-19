import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../lib/utils'
import { getWallet } from '../lib/wallet'
import { get, cancelled } from '../lib/prompt'
import * as requests from '../lib/requests'

import { protocolNames, protocolInterfaces } from '@airswap/constants'

export default class Inspect extends Command {
  public static description = 'inspect protocols for a server'
  public async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      utils.displayDescription(this, Inspect.description, chainId)

      const { locator }: any = await get({
        locator: {
          type: 'Locator',
        },
      })
      this.log()

      requests.peerCall(locator, 'getProtocols', {}, async (err, protocols) => {
        if (err) {
          if (err === 'timeout') {
            this.log(chalk.yellow('The request timed out.\n'))
          } else {
            cancelled(err)
          }
          process.exit(0)
        } else {
          this.log(chalk.white.bold('supported protocols and methods\n'))
          const unknown = []
          for (const p in protocols) {
            const interfaceId = protocols[p].interfaceId
            const functions = protocolInterfaces[interfaceId]
            if (functions) {
              const _interface = new ethers.utils.Interface(
                protocolInterfaces[interfaceId]
              )
              this.log(protocolNames[interfaceId])
              for (const f in _interface.fragments) {
                this.log('· ', _interface.fragments[f].name)
              }
              this.log()
            } else {
              unknown.push(interfaceId)
            }
          }
          if (unknown.length) {
            this.log(chalk.yellow(`Unknown interfaces`))
            for (const u in unknown) {
              this.log('· ', chalk.yellow(unknown[u]))
            }
          }
        }
        this.log()
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
