import chalk from 'chalk'
import * as jayson from 'jayson'
import { Command } from '@oclif/command'
import * as utils from '../lib/utils'
import { getWallet } from '../lib/wallet'
import {
  get,
  getTokens,
  cancelled,
  clearLines,
  printQuote,
  confirm,
} from '../lib/prompt'
import {
  getPriceForAmount,
  createOrderERC20,
  createOrderERC20Signature,
  toAtomicString,
  toDecimalString,
} from '@airswap/utils'
import { ProtocolIds } from '@airswap/utils'
import { Server, SwapERC20 } from '@airswap/libraries'
import readline from 'readline'

const constants = require('../lib/constants.json')

export default class Stream extends Command {
  public static description = 'stream quotes for a swap'
  public async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, Stream.description, chainId)

      const { url, side, amount }: any = await get({
        url: {
          type: 'Locator',
        },
        side: {
          description: 'buy or sell',
          type: 'Side',
        },
        amount: {
          type: 'Number',
        },
      })
      const { first, second }: any = await getTokens(
        { first: 'of', second: 'for' },
        metadata
      )
      this.log('\n\n\n')

      const swapContract = SwapERC20.getAddress(chainId)
      let signerToken
      let senderToken
      let signerAmount
      let senderAmount
      let senderWallet
      let senderServer
      let taking = false

      if (side === 'buy') {
        senderToken = first
        signerToken = second
        senderAmount = amount
      } else {
        signerToken = first
        senderToken = second
        signerAmount = amount
      }

      const server = await Server.at(url)

      if (server.supportsProtocol(ProtocolIds.LastLookERC20)) {
        senderWallet = await server.getSenderWallet()
        await server.subscribeAllPricingERC20()
        server.on('pricing-erc20', (pricing) => {
          try {
            if (side === 'buy') {
              signerAmount = getPriceForAmount(
                'buy',
                senderAmount,
                senderToken.address,
                signerToken.address,
                pricing
              )
            } else {
              senderAmount = getPriceForAmount(
                'sell',
                signerAmount,
                signerToken.address,
                senderToken.address,
                pricing
              )
            }
            if (signerAmount === null || senderAmount === null) {
              console.log('Pricing not available for selected pair.')
              process.exit(0)
            } else {
              if (!taking) {
                clearLines(3)
                printQuote(
                  this,
                  signerToken,
                  signerAmount,
                  senderToken,
                  senderAmount
                )
                console.log(chalk.gray(`ENTER to proceed, CTRL+C to Cancel`))
              }
            }
          } catch (e) {
            console.log(`${chalk.yellow('Error')} ${e.message}\n`)
            process.exit(0)
          }
        })
      } else {
        console.log('Server does not support LastLookERC20.')
        process.exit(0)
      }

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      })

      rl.on('line', async () => {
        taking = true
        rl.close()

        const protocolFee = await SwapERC20.getContract(
          wallet.provider,
          chainId
        ).protocolFee()

        const order = createOrderERC20({
          nonce: String(Date.now()),
          expiry: String(Math.round(Date.now() / 1000) + 120),
          protocolFee: protocolFee.toNumber(),
          signerWallet: wallet.address,
          signerToken: signerToken.address,
          signerAmount: toAtomicString(signerAmount, signerToken.decimals),
          senderWallet,
          senderToken: senderToken.address,
          senderAmount: toAtomicString(senderAmount, senderToken.decimals),
        })
        const signature = await createOrderERC20Signature(
          order,
          wallet.privateKey,
          swapContract,
          chainId
        )

        delete order.protocolFee
        delete order.senderWallet

        if (
          await confirm(
            this,
            metadata,
            'swap',
            {
              signerWallet: `${order.signerWallet} (${chalk.cyan('You')})`,
              signerToken: order.signerToken,
              signerAmount: `${order.signerAmount} (${chalk.cyan(
                toDecimalString(
                  order.signerAmount,
                  metadata.byAddress[signerToken.address].decimals
                )
              )})`,
              senderWallet,
              senderToken: order.senderToken,
              senderAmount: `${order.senderAmount} (${chalk.cyan(
                toDecimalString(
                  order.senderAmount,
                  metadata.byAddress[senderToken.address].decimals
                )
              )})`,
            },
            chainId,
            'make this order',
            false
          )
        ) {
          if (senderServer) {
            console.log(`Sending order to ${chalk.bold(senderServer)}...`)
            const locatorUrl = url.parse(senderServer)
            const options = {
              protocol: locatorUrl.protocol,
              hostname: locatorUrl.hostname,
              path: locatorUrl.path,
              port: locatorUrl.port,
              timeout: constants.REQUEST_TIMEOUT,
            }

            let client
            if (options.protocol === 'http:') {
              client = jayson.Client.http(options)
            } else if (options.protocol === 'https:') {
              client = jayson.Client.https(options)
            }
            client.request(
              'considerOrderERC20',
              {
                ...order,
                ...signature,
              },
              function (err: any, error: any, result: any) {
                if (err || error) {
                  console.log(chalk.yellow(err.message || error.message))
                } else {
                  console.log(result, '\n')
                }
              }
            )
          } else {
            console.log('Sending order over the socket...')
            try {
              await server.considerOrderERC20({
                ...order,
                ...signature,
              })
            } catch (e) {
              cancelled(e.error ? e.error : e)
            }
            process.exit(0)
          }
        } else {
          cancelled('Cancelled')
          process.exit(0)
        }
      })
    } catch (e) {
      cancelled(e.message)
      process.exit(0)
    }
  }
}
