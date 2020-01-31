import { ethers } from 'ethers'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { printObject, printOrder, confirm } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import BigNumber from 'bignumber.js'

const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')
const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')

export default class OrderBest extends Command {
  static description = 'get the best available order'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, OrderBest.description, chainId)

    try {
      const request = await requests.getRequest(wallet, metadata, 'Order')

      const swapAddress = swapDeploys[chainId]
      const tokenContract = new ethers.Contract(request.params.senderToken, IERC20.abi, wallet)
      const allowance = await tokenContract.allowance(wallet.address, swapAddress)

      if (allowance.lt(request.params.senderAmount || 0)) {
        this.log(
          `${chalk.yellow(
            `\nYou have not approved ${chalk.bold(request.senderToken.name)} for trading.`,
          )} Approve it with ${chalk.bold('token:approve')}\n`,
        )
      } else {
        this.log()
        printObject(this, metadata, `Request: ${request.method}`, request.params)

        requests.multiPeerCall(
          wallet,
          request.method,
          request.params,
          async (order: any, locator: string, errors: Array<any>) => {
            this.log()

            if (!order) {
              this.log(chalk.yellow('\nNo peers found.\n'))
            } else {
              printOrder(this, request.side, request.signerToken, request.senderToken, locator, order)

              this.log(`Expiry ${chalk.green(new Date(order.expiry * 1000).toLocaleTimeString())}\n`)

              const allowance = await tokenContract.allowance(wallet.address, swapAddress)

              if (allowance.lt(order.sender.amount)) {
                this.log(
                  `${chalk.yellow(
                    `\nYou have not approved ${chalk.bold(request.senderToken.name)} for trading.`,
                  )} Approve it with ${chalk.bold('token:approve')}\n`,
                )
              } else {
                const signerTokenBalance = await new ethers.Contract(order.signer.token, IERC20.abi, wallet).balanceOf(
                  wallet.address,
                )
                const signerTokenBalanceDecimal = new BigNumber(signerTokenBalance.toString())
                  .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                  .toFixed()
                const senderTokenBalance = await new ethers.Contract(order.sender.token, IERC20.abi, wallet).balanceOf(
                  wallet.address,
                )
                const senderTokenBalanceDecimal = new BigNumber(senderTokenBalance.toString())
                  .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                  .toFixed()

                const newSignerTokenBalance = new BigNumber(signerTokenBalance.add(order.signer.amount))
                  .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                  .toFixed()
                const newSenderTokenBalance = new BigNumber(senderTokenBalance.sub(order.sender.amount))
                  .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                  .toFixed()

                const signerTokenChangeDecimal = new BigNumber(order.signer.amount)
                  .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                  .toFixed()
                const senderTokenChangeDecimal = new BigNumber(order.sender.amount)
                  .dividedBy(new BigNumber(10).pow(request.senderToken.decimals))
                  .toFixed()

                if (
                  await confirm(
                    this,
                    metadata,
                    'swap',
                    {
                      signerWallet: order.signer.wallet,
                      signerToken: order.signer.token,
                      signerAmount: `${order.signer.amount} (${chalk.cyan(
                        new BigNumber(order.signer.amount)
                          .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
                          .toFixed(),
                      )})`,
                      senderWallet: `${order.sender.wallet} (${chalk.cyan('You')})`,
                      senderToken: order.sender.token,
                      senderAmount: `${order.sender.amount} (${chalk.cyan(
                        new BigNumber(order.sender.amount)
                          .dividedBy(new BigNumber(10).pow(request.senderToken.decimals))
                          .toFixed(),
                      )})`,
                    },
                    chainId,
                    'take this order',
                    [
                      {
                        Token: request.signerToken.name,
                        'Current balance': signerTokenBalanceDecimal,
                        Change: `+${chalk.bold(signerTokenChangeDecimal)}`,
                        'New balance': newSignerTokenBalance,
                      },
                      {
                        Token: request.senderToken.name,
                        'Current balance': senderTokenBalanceDecimal,
                        Change: `-${chalk.bold(senderTokenChangeDecimal)}`,
                        'New balance': newSenderTokenBalance,
                      },
                    ],
                  )
                ) {
                  const swapAddress = swapDeploys[chainId]
                  new ethers.Contract(swapAddress, Swap.abi, wallet)
                    .swap(order)
                    .then(utils.handleTransaction)
                    .catch(utils.handleError)
                }
              }
            }
          },
        )
      }
    } catch (e) {
      this.log('\n\nCancelled.\n')
    }
  }
}
