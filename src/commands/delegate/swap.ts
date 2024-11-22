import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, cancelled, confirm } from '../../lib/prompt'
import {
  createOrderERC20,
  toAtomicString,
  createOrderERC20Signature,
} from '@airswap/utils'
import { SwapERC20 } from '@airswap/libraries'
const Delegate = require('@airswap/delegate/build/contracts/Delegate.sol/Delegate.json')
const delegateDeploys = require('@airswap/delegate/deploys.js')
const IERC20 = require('@airswap/utils/build/src/abis/ERC20.json')

export default class DelegateSwap extends Command {
  public static description = 'swap with the delegate'

  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, DelegateSwap.description, chainId)

      const delegateContract = new ethers.Contract(
        delegateDeploys[chainId],
        Delegate.abi,
        wallet
      )

      this.log(chalk.white(`Delegate contract: ${delegateContract.address}\n`))
      this.log(metadata)
      const {
        signerWallet,
        senderAmount,
        senderToken,
        signerToken,
        signerAmount,
      }: any = await get({
        signerWallet: {
          description: 'from',
          type: 'Address',
        },
        senderToken: {
          description: 'of',
          type: 'Address',
        },
        senderAmount: {
          description: 'amount',
          type: 'Number',
        },
        signerToken: {
          description: 'for',
          type: 'Address',
        },
        signerAmount: {
          description: 'amount',
          type: 'Number',
        },
      })

      const swapContract = SwapERC20.getAddress(chainId)

      const protocolFee = await SwapERC20.getContract(
        wallet.provider,
        chainId
      ).protocolFee()

      const order = createOrderERC20({
        nonce: String(Date.now()),
        expiry: String(Math.round(Date.now() / 1000) + 120),
        protocolFee: protocolFee.toString(),
        signerWallet: signerWallet,
        signerToken: signerToken,
        signerAmount: toAtomicString(signerAmount, signerToken.decimals),
        senderWallet: delegateContract.address,
        senderToken: senderToken,
        senderAmount: toAtomicString(senderAmount, senderToken.decimals),
      })

      const signature = await createOrderERC20Signature(
        order,
        wallet.privateKey,
        swapContract,
        chainId
      )

      if (
        !(await confirm(
          this,
          metadata,
          'swap',
          {
            ...order,
          },
          chainId
        ))
      ) {
        this.log(chalk.yellow('Swap failed'))
        process.exit(0)
      }

      await delegateContract
        .swap(
          order.senderWallet,
          order.nonce,
          order.expiry,
          order.signerWallet,
          order.signerToken,
          order.signerAmount,
          order.senderToken,
          order.senderAmount,
          signature.v,
          signature.r,
          signature.s
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
