import chalk from 'chalk'
import { Command } from '@oclif/command'
import * as utils from '../lib/utils'
import { get, cancelled } from '../lib/prompt'
import { parseOrderFromHex, isValidOrder } from '@airswap/utils'
import { Validator } from '@airswap/protocols'
import * as wrapperDeploys from '@airswap/wrapper/deploys.json'

export default class Debug extends Command {
  static description = 'debug a transaction given its input data'
  async run() {
    try {
      const wallet = await utils.getWallet(this)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
      utils.displayDescription(this, Debug.description, chainId)

      const { hex }: any = await get({
        hex: {
          description: 'transaction input data',
        },
      })
      const { functionName, order, delegateAddress }: any = parseOrderFromHex(hex)

      if (isValidOrder(order)) {
        try {
          let errors
          switch (functionName) {
            case 'provideDelegateOrder':
              let { wrapper }: any = await get({
                wrapperAddress: {
                  description: 'wrapper address',
                  default: wrapperDeploys[chainId],
                },
              })
              errors = await new Validator(chainId).checkWrappedDelegate(order, delegateAddress, wrapper)
              break
            case 'provideOrder':
              const { delegate }: any = await get({
                delegateAddress: {
                  description: 'delegate address',
                  default: order.sender.wallet,
                },
              })
              errors = await new Validator(chainId).checkDelegate(order, delegate)
              break
            default:
              const { thruWrapper }: any = await get({
                thruWrapper: {
                  description: 'sent through a wrapper contract? (y/n)',
                  default: 'y',
                },
              })
              if (thruWrapper === 'y') {
                const { fromAddress, wrapperAddress }: any = await get({
                  fromAddress: {
                    description: 'sender address',
                    default: order.sender.wallet,
                  },
                  wrapperAddress: {
                    description: 'wrapper address',
                    default: wrapperDeploys[chainId],
                  },
                })
                errors = await new Validator(chainId).checkWrappedSwap(order, fromAddress, wrapperAddress)
              } else {
                errors = await new Validator(chainId).checkSwap(order)
              }
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
