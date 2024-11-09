import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { cancelled, confirm } from '../../lib/prompt'
const Delegate = require('@airswap/delegate/build/contracts/Delegate.sol/Delegate.json')
const delegateDeploys = require('@airswap/delegate/deploys.js')

export default class DelegateRevoke extends Command {
  public static description = 'set a delegate rule'

  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, DelegateRevoke.description, chainId)

      const delegateContract = new ethers.Contract(
        delegateDeploys[chainId],
        Delegate.abi,
        wallet
      )

      this.log(chalk.white(`Delegate contract: ${delegateContract.address}\n`))

      this.log(
        chalk.white(
          `Revoking ${await delegateContract.authorized(
            wallet.address
          )} to set and unset Rules for ${wallet.address}`
        )
      )
      if (!(await confirm(this, metadata, 'revoke', {}, chainId))) {
        this.log(chalk.red('Manager not revoked'))
        process.exit(0)
      }

      await delegateContract
        .revoke()
        .then(utils.handleTransaction)
        .catch(utils.handleError)
    } catch (e) {
      cancelled(e)
    }
  }
}
