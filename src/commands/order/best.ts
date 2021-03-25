import { ethers } from 'ethers'
import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { printOrder, confirm, cancelled } from '../../lib/prompt'
import * as requests from '../../lib/requests'
import { Validator } from '@airswap/protocols'
import { toDecimalString, lightOrderToParams } from '@airswap/utils'
const Swap = require('@airswap/swap/build/contracts/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.json')
const Light = require('@airswap/light/build/contracts/Light.json')
const lightDeploys = require('@airswap/light/deploys.json')

export default class OrderBest extends Command {
  static description = 'get the best available order'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
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
            handleLightResponse(request, wallet, metadata, chainId, gasPrice, this, order)
          },
          true,
        )
      } else {
        requests.multiPeerCall(wallet, request.method, request.params, protocol, (order: any) => {
          handleFullResponse(request, wallet, metadata, chainId, gasPrice, this, order)
        })
      }
    } catch (e) {
      cancelled(e)
    }
  }
}

async function handleFullResponse(
  request: any,
  wallet: any,
  metadata: any,
  chainId: any,
  gasPrice: any,
  ctx: any,
  order: any,
) {
  if (!order) {
    ctx.log(chalk.yellow('No valid responses received.\n'))
  } else {
    ctx.log()
    ctx.log(chalk.underline.bold(`Signer: ${order.signer.wallet}\n`))
    await printOrder(ctx, request, order, wallet, metadata)
    const errors = await new Validator(chainId).checkSwap(order)

    if (errors.length) {
      ctx.log(chalk.yellow('Unable to take (as sender) for the following reasons.\n'))
      for (const e in errors) {
        ctx.log(`‣ ${Validator.getReason(errors[e])}`)
      }
      ctx.log()
    } else {
      if (
        await confirm(
          ctx,
          metadata,
          'swap',
          {
            signerWallet: order.signer.wallet,
            signerToken: order.signer.token,
            signerAmount: `${order.signer.amount} (${chalk.cyan(
              toDecimalString(order.signer.amount, metadata.byAddress[request.signerToken.address].decimals),
            )})`,
            senderWallet: `${order.sender.wallet} (${chalk.cyan('You')})`,
            senderToken: order.sender.token,
            senderAmount: `${order.sender.amount} (${chalk.cyan(
              toDecimalString(order.sender.amount, metadata.byAddress[request.senderToken.address].decimals),
            )})`,
          },
          chainId,
          'take this order',
        )
      ) {
        new ethers.Contract(swapDeploys[chainId], Swap.abi, wallet)
          .swap(order, { gasPrice })
          .then(utils.handleTransaction)
          .catch(utils.handleError)
      }
    }
  }
}

async function handleLightResponse(
  request: any,
  wallet: any,
  metadata: any,
  chainId: any,
  gasPrice: any,
  ctx: any,
  order: any,
) {
  if (!order) {
    ctx.log(chalk.yellow('No valid responses received.\n'))
  } else {
    ctx.log()
    ctx.log(chalk.underline.bold(`Signer: ${order.signerWallet}\n`))

    if (
      await confirm(
        ctx,
        metadata,
        'light',
        {
          signerWallet: order.signerWallet,
          signerToken: order.signerToken,
          signerAmount: `${order.signerAmount} (${chalk.cyan(
            toDecimalString(order.signerAmount, metadata.byAddress[request.signerToken.address].decimals),
          )})`,
          senderWallet: `${request.params.senderWallet} (${chalk.cyan('You')})`,
          senderToken: order.senderToken,
          senderAmount: `${order.senderAmount} (${chalk.cyan(
            toDecimalString(order.senderAmount, metadata.byAddress[request.senderToken.address].decimals),
          )})`,
        },
        chainId,
        'take this order',
      )
    ) {
      new ethers.Contract(lightDeploys[chainId], Light.abi, wallet)
        .swap(...lightOrderToParams(order), { gasPrice })
        .then(utils.handleTransaction)
        .catch(utils.handleError)
    }
  }
}
