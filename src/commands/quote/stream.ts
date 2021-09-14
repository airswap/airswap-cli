import WebSocket from 'ws'
import chalk from 'chalk'
import * as jayson from 'jayson'
import * as url from 'url'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, getTokens, cancelled, clearLines, printQuote, confirm } from '../../lib/prompt'
import { createLightOrder, createLightSignature, toAtomicString, toDecimalString } from '@airswap/utils'
import readline from 'readline'
import { create, all } from 'mathjs'

const constants = require('../../lib/constants.json')
const lightDeploys = require('@airswap/light/deploys.js')

export default class OrderStream extends Command {
  static description = 'stream quotes for a swap'
  async run() {
    try {
      const wallet = await getWallet(this)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const math = create(all, {
        number: 'BigNumber',
        precision: 20,
      })
      utils.displayDescription(this, OrderStream.description, chainId)

      let taking = false

      const { server, side, amount }: any = await get({
        server: {
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

      let signerToken
      let senderToken
      let signerAmount
      let senderAmount

      let pricingFormula
      let swapContract = lightDeploys[chainId]
      let senderWallet
      let senderServer

      if (side === 'buy') {
        senderToken = first
        signerToken = second
        senderAmount = amount
      } else {
        signerToken = first
        senderToken = second
        signerAmount = amount
      }

      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      })
      const ws = new WebSocket(server)

      ws.on('open', function open() {
        ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'subscribeAll',
            id: Date.now(),
            params: {},
          }),
        )
      })

      ws.on('message', message => {
        let json
        try {
          json = JSON.parse(message)
        } catch (e) {
          console.log('Failed to parse JSON-RPC message', message)
          return
        }
        try {
          if (json.id) {
            if (json.params.baseToken === senderToken.address) {
              if (json.params.quoteToken === signerToken.address) {
                pricingFormula = json.params.pricingFormula
              }
            }
          } else
            switch (json.method) {
              case 'initialize':
                senderWallet = json.params.senderWallet
                swapContract = json.params.swapContract
                senderServer = json.params.senderServer
                break
              case 'updateValues':
                if (json.params.baseToken.toLowerCase() === senderToken.address) {
                  if (json.params.quoteToken.toLowerCase() === signerToken.address) {
                    if (side === 'buy') {
                      signerAmount = math.evaluate(pricingFormula, json.params)
                    } else {
                      senderAmount = math.evaluate(pricingFormula, json.params)
                    }
                  }
                }
                if (!taking) {
                  clearLines(3)
                  printQuote(this, signerToken, signerAmount, senderToken, senderAmount)
                  console.log(chalk.gray(`ENTER to proceed, CTRL+C to Cancel`))
                }
                break
              case 'updatePricing':
                const levels = json.params
                for (const i in levels) {
                  let baseToken = signerToken.address
                  let quoteToken = senderToken.address
                  if (side === 'buy') {
                    baseToken = senderToken.address
                    quoteToken = signerToken.address
                  }
                  if (levels[i].baseToken.toLowerCase() === baseToken) {
                    if (levels[i].quoteToken.toLowerCase() === quoteToken) {
                      if (side === 'buy') {
                        signerAmount = utils.calculateCostFromLevels(senderAmount, levels[i].ask)
                      } else {
                        senderAmount = utils.calculateCostFromLevels(signerAmount, levels[i].bid)
                      }
                    }
                  }
                }
                if (!taking) {
                  clearLines(3)
                  printQuote(this, signerToken, signerAmount, senderToken, senderAmount)
                  console.log(chalk.gray(`ENTER to proceed, CTRL+C to Cancel`))
                }
                break
            }
        } catch (e) {
          console.log(e.message, '\n')
          ws.close()
          rl.close()
        }
      })

      rl.on('line', async () => {
        taking = true
        rl.close()

        const order = createLightOrder({
          expiry: String(Math.round(Date.now() / 1000) + 120),
          signerFee: '7',
          signerWallet: wallet.address,
          signerToken: signerToken.address,
          signerAmount: toAtomicString(signerAmount, signerToken.decimals),
          senderWallet,
          senderToken: senderToken.address,
          senderAmount: toAtomicString(senderAmount, senderToken.decimals),
        })
        const signature = await createLightSignature(order, wallet.privateKey, swapContract, chainId)

        delete order.signerFee
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
          console.log(`Sending order to ${chalk.bold(senderServer)}...`)

          if (senderServer) {
            ws.close()
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
                taking = false
              },
            )
          } else {
            ws.send(
              JSON.stringify({
                jsonrpc: '2.0',
                method: 'consider',
                params: {
                  ...order,
                  ...signature,
                },
              }),
            )
          }
        } else {
          process.exit(0)
        }
      })
    } catch (e) {
      cancelled(e)
      process.exit(0)
    }
  }
}
