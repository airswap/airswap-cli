import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, cancelled } from '../../lib/prompt'
import { parseOrderFromHex, isValidOrder } from '@airswap/utils'
import { Validator } from '@airswap/protocols'
import * as wrapperDeploys from '@airswap/wrapper/deploys.json'

export default class OrderValidate extends Command {
  static description = 'validate an order in hex format'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
      utils.displayDescription(this, OrderValidate.description, chainId)

      const { type, hex }: any = await get({
        hex: {
          description: 'transaction input data',
        },
        type: {
          description: 'destination (1=swap, 2=wrappedSwap, 3=delegate, 4=wrappedDelegate)',
          kind: 'Number',
          default: '1',
        },
      })
      const order = parseOrderFromHex(hex)

      if (isValidOrder(order)) {
        try {
          let errors
          switch (type) {
            case '2':
              const { fromAddress, wrapperAddress }: any = await get({
                fromAddress: {
                  description: 'sender wallet',
                  default: order.sender.wallet,
                },
                wrapperAddress: {
                  description: 'wrapper address',
                  default: wrapperDeploys[chainId],
                },
              })
              errors = await new Validator(chainId).checkWrappedSwap(order, fromAddress, wrapperAddress)
              break
            case '3':
              const { delegateAddress }: any = await get({
                delegateAddress: {
                  description: 'delegate address',
                  default: order.sender.wallet,
                },
              })
              errors = await new Validator(chainId).checkDelegate(order, delegateAddress)
              break
            case '4':
              let { delegate, wrapper }: any = await get({
                delegateAddress: {
                  description: 'delegate address',
                  default: order.sender.wallet,
                },
                wrapperAddress: {
                  description: 'wrapper address',
                  default: wrapperDeploys[chainId],
                },
              })
              errors = await new Validator(chainId).checkWrappedDelegate(order, delegateAddress, wrapperAddress)
              break
            default:
              errors = await new Validator(chainId).checkSwap(order)
              break
          }

          this.log(`\n${JSON.stringify(order, null, 2)}\n`)

          if (errors.length) {
            this.log(chalk.yellow('This order would fail for the following reasons.\n'))
            for (const e in errors) {
              this.log(`‣ ${Validator.getReason(errors[e])}`)
            }
            this.log()
          } else {
            this.log('This order is valid and would succeed.')
          }
        } catch (e) {
          this.log(chalk.yellow('\nThe underlying check failed. Are you on the correct chain?\n'))
        }
      } else {
        this.log(`\n${JSON.stringify(order, null, 2)}\n`)
        this.log(chalk.yellow('\nThis order has invalid parameters or an invalid signature.\n'))
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
