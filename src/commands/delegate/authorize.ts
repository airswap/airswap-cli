import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, cancelled, confirm } from '../../lib/prompt'
const Delegate = require('@airswap/delegate/build/contracts/Delegate.sol/Delegate.json')
const delegateDeploys = require('@airswap/delegate/deploys.js')

export default class DelegateAuthorize extends Command {
  public static description = 'set a delegate rule'

  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, DelegateAuthorize.description, chainId)

      const delegateContract = new ethers.Contract(
        delegateDeploys[chainId],
        Delegate.abi,
        wallet
      )

      this.log(chalk.white(`Delegate contract: ${delegateContract.address}\n`))

      const { manager }: any = await get({
        manager: {
          description: 'Manager address',
          type: 'Address',
        },
      })

      this.log(
        chalk.white(
          `Authorizing ${manager} to set and unset Rules for ${wallet.address}`
        )
      )
      if (!(await confirm(this, metadata, 'authorize', { manager }, chainId))) {
        this.log(chalk.red('Manager not authorized'))
        process.exit(0)
      }

      await delegateContract
        .authorize(manager)
        .then(utils.handleTransaction)
        .catch(utils.handleError)
    } catch (e) {
      cancelled(e)
    }
  }
}
