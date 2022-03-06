import chalk from 'chalk'
import * as jayson from 'jayson'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, getTokens, cancelled, clearLines, printQuote, confirm } from '../../lib/prompt'
import { calculateCost, createOrder, createSwapSignature, toAtomicString, toDecimalString } from '@airswap/utils'
import { Server } from '@airswap/libraries'
import readline from 'readline'

const constants = require('../../lib/constants.json')
const swapDeploys = require('@airswap/swap/deploys.js')

export default class OrderStream extends Command {
  static description = 'stream quotes for a swap'
  async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, OrderStream.description, chainId)

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
      const { first, second }: any = await getTokens({ first: 'of', second: 'for' }, metadata)
      this.log('\n\n\n')

      const swapContract = swapDeploys[chainId]
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

      if (server.supportsProtocol('last-look')) {
        senderWallet = await server.getSenderWallet()
        await server.subscribeAll()
        server.on('pricing', pricing => {
          let found = false
          for (const i in pricing) {
            let baseToken = signerToken.address
            let quoteToken = senderToken.address
            if (side === 'buy') {
              baseToken = senderToken.address
              quoteToken = signerToken.address
            }
            if (pricing[i].baseToken.toLowerCase() === baseToken.toLowerCase()) {
              if (pricing[i].quoteToken.toLowerCase() === quoteToken.toLowerCase()) {
                if (side === 'buy') {
                  signerAmount = calculateCost(senderAmount, pricing[i].ask)
                } else {
                  senderAmount = calculateCost(signerAmount, pricing[i].bid)
                }
                found = true
              }
            }
          }
          if (found) {
            if (!taking) {
              clearLines(3)
              printQuote(this, signerToken, signerAmount, senderToken, senderAmount)
              console.log(chalk.gray(`ENTER to proceed, CTRL+C to Cancel`))
            }
          } else {
            console.log('Pricing not available for selected pair.')
            process.exit(0)
          }
        })
      } else {
        console.log('Server does not support last-look.')
        process.exit(0)
      }

      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      })

      rl.on('line', async () => {
        taking = true
        rl.close()

        const order = createOrder({
          expiry: String(Math.round(Date.now() / 1000) + 120),
          protocolFee: '30',
          signerWallet: wallet.address,
          signerToken: signerToken.address,
          signerAmount: toAtomicString(signerAmount, signerToken.decimals),
          senderWallet,
          senderToken: senderToken.address,
          senderAmount: toAtomicString(senderAmount, senderToken.decimals),
        })
        const signature = await createSwapSignature(order, wallet.privateKey, swapContract, chainId)

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
                toDecimalString(order.signerAmount, metadata.byAddress[signerToken.address].decimals),
              )})`,
              senderWallet,
              senderToken: order.senderToken,
              senderAmount: `${order.senderAmount} (${chalk.cyan(
                toDecimalString(order.senderAmount, metadata.byAddress[senderToken.address].decimals),
              )})`,
            },
            chainId,
            'make this order',
            false,
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
              'consider',
              {
                ...order,
                ...signature,
              },
              function(err: any, error: any, result: any) {
                if (err || error) {
                  console.log(chalk.yellow(err.message || error.message))
                } else {
                  console.log(result, '\n')
                }
              },
            )
          } else {
            console.log('Sending order over the socket...')
            try {
              await server.consider({
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
      cancelled(e.error ? e.error : e)
      process.exit(0)
    }
  }
}
