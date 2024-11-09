import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, cancelled, confirm } from '../../lib/prompt'
const Delegate = require('@airswap/delegate/build/contracts/Delegate.sol/Delegate.json')
const delegateDeploys = require('@airswap/delegate/deploys.js')

export default class DelegateUnsetRule extends Command {
  public static description = 'unset a delegate rule'

  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, DelegateUnsetRule.description, chainId)

      const delegateContract = new ethers.Contract(
        delegateDeploys[chainId],
        Delegate.abi,
        wallet
      )

      this.log(chalk.white(`Delegate contract: ${delegateContract.address}\n`))

      const { senderWallet }: any = await get({
        senderWallet: {
          description: 'Sender wallet',
          type: 'Address',
        },
      })

      const { senderToken }: any = await get({
        senderToken: {
          description: 'Sender token',
          type: 'Token',
        },
      })

      const { signerToken }: any = await get({
        signerToken: {
          description: 'Signer token',
          type: 'Token',
        },
      })

      this.log(
        chalk.white(
          `Unsetting delegate rule: \n
          senderWallet: ${senderWallet}\n
          senderToken: ${senderToken}\n
          signerToken: ${signerToken}\n`
        )
      )

      if (
        !(await confirm(
          this,
          metadata,
          'unsetRule',
          {
            senderWallet,
            senderToken,
            signerToken,
          },
          chainId
        ))
      ) {
        this.log(chalk.yellow('Swap failed'))
        process.exit(0)
      }

      await delegateContract
        .unsetRule(senderWallet, signerToken, signerToken)
        .then(utils.handleTransaction)
        .catch(utils.handleError)
    } catch (e) {
      cancelled(e)
    }
  }
}
