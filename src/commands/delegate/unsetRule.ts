import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, cancelled } from '../../lib/prompt'
const Delegate = require('@airswap/delegate/build/contracts/Delegate.sol/Delegate.json')
const delegateDeploys = require('@airswap/delegate/deploys.js')
const IERC20 = require('@airswap/utils/build/src/abis/ERC20.json')

export default class DelegateUnsetRule extends Command {
  public static description = 'unset a delegate rule'

  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
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
      await this.validateSenderWallet(senderWallet, wallet, delegateContract)

      const { senderToken }: any = await get({
        senderToken: {
          description: 'Sender token',
          type: 'Address',
        },
      })
      const senderTokenSymbol = await this.validateERC20Address(
        senderToken,
        wallet
      )

      const { signerToken }: any = await get({
        signerToken: {
          description: 'Sender token',
          type: 'Address',
        },
      })
      const signerTokenSymbol = await this.validateERC20Address(
        signerToken,
        wallet
      )

      this.log(
        chalk.white(
          `Unsetting delegate rule: \n
          senderWallet: ${senderWallet}\n
          senderToken: ${senderTokenSymbol}\n
          signerToken: ${signerTokenSymbol}\n`
        )
      )
      const { confirmation }: any = await get({
        confirmation: {
          description: 'Confirm rule unset(y/n)?',
          type: 'String',
        },
      })
      console.log(confirmation)
      if (confirmation !== 'y') {
        this.log(chalk.yellow('Rule unsetting failed'))
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

  public async validateERC20Address(address: string, wallet: any) {
    const senderTokenContract = new ethers.Contract(address, IERC20.abi, wallet)
    if (!senderTokenContract) {
      throw new Error(`Address ${address}: Invalid ERC20 token.`)
    } else {
      try {
        const senderTokenSymbol: string = await senderTokenContract.symbol()
        if (!senderTokenSymbol) {
          throw new Error(`Address ${address}: Invalid ERC20 token.`)
        }
        return senderTokenSymbol
      } catch (e) {
        throw new Error(`Address ${address}: Invalid ERC20 token.`)
      }
    }
  }

  public async validateSenderWallet(
    address: string,
    wallet: any,
    delegateContract: any
  ) {
    if (address !== wallet.address) {
      const { authorizedWallet } = await delegateContract.authorized(address)
      if (!authorizedWallet || authorizedWallet !== wallet.address) {
        throw new Error(`Address ${address}: Unauthorized wallet.`)
      }
    }
  }
}
