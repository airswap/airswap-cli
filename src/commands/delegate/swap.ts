import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, cancelled, confirm } from '../../lib/prompt'
const Delegate = require('@airswap/delegate/build/contracts/Delegate.sol/Delegate.json')
const delegateDeploys = require('@airswap/delegate/deploys.js')
const IERC20 = require('@airswap/utils/build/src/abis/ERC20.json')

export default class DelegateSetRule extends Command {
  public static description = 'set a delegate rule'

  public async run() {
    try {
      const wallet = await getWallet(this, true)
      console.log(wallet.address)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, DelegateSetRule.description, chainId)

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

      const { nonce }: any = await get({
        nonce: {
          description: 'Nonce',
          type: 'Number',
        },
      })

      const { expiry }: any = await get({
        expiry: {
          description: 'Expiry',
          type: 'Number',
        },
      })

      const { signerWallet }: any = await get({
        signerWallet: {
          description: 'Signer wallet',
          type: 'Address',
        },
      })

      const { signerToken }: any = await get({
        signerToken: {
          description: 'Signer token',
          type: 'Token',
        },
      })

      const { signerAmount }: any = await get({
        signerAmount: {
          description: 'Signer Amount',
          type: 'Number',
        },
      })
      await this.validateAmount(signerAmount)

      const { senderToken }: any = await get({
        senderToken: {
          description: 'Sender token',
          type: 'Token',
        },
      })

      const { senderAmount }: any = await get({
        senderAmount: {
          description: 'Sender amount',
          type: 'Number',
        },
      })
      await this.validateAmount(senderAmount)

      const { v }: any = await get({
        v: {
          description: 'v',
          type: 'Number',
        },
      })

      const { r }: any = await get({
        r: {
          description: 'r',
          type: 'bytes32',
        },
      })

      const { s }: any = await get({
        s: {
          description: 's',
          type: 'bytes32',
        },
      })

      this.log(
        chalk.white(
          `Swapping: \n
          senderWallet: ${senderWallet}\n,
          nonce: ${nonce}\n,
          expiry: ${expiry}\n,
          signerWallet: ${signerWallet}\n,
          signerToken: ${signerToken}\n,
          signerAmount: ${signerAmount}\n,
          senderToken: ${senderToken}\n,
          senderAmount: ${senderAmount}\n,
          v: ${v}\n,
          r: ${r}\n,
          s:${s}\n`
        )
      )

      if (
        !(await confirm(
          this,
          metadata,
          'swap',
          {
            senderWallet,
            nonce,
            expiry,
            signerWallet,
            signerToken,
            signerAmount,
            senderToken,
            senderAmount,
            v,
            r,
            s,
          },
          chainId
        ))
      ) {
        this.log(chalk.yellow('Swap failed'))
        process.exit(0)
      }

      await delegateContract
        .swap(
          senderWallet,
          nonce,
          expiry,
          signerWallet,
          signerToken,
          signerAmount,
          senderToken,
          senderAmount,
          v,
          r,
          s
        )
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

  public async validateAmount(amount: number) {
    if (!Number.isInteger(amount) && amount <= 0) {
      throw new Error(`${amount} is invalid.`)
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
