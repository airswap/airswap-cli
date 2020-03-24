import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, getSideAndTokens, confirm, cancelled } from '../../lib/prompt'
import { stakingTokenAddresses, protocolNames, ADDRESS_ZERO, LOCATOR_ZERO } from '@airswap/constants'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const Index = require('@airswap/indexer/build/contracts/Index.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentSet extends Command {
  static description = 'set an intent'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = String((await wallet.provider.getNetwork()).chainId)
      const metadata = await utils.getMetadata(this, chainId)
      const protocol = await utils.getProtocol(this)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, IntentSet.description, chainId)

      const indexerAddress = indexerDeploys[chainId]
      const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      this.log(chalk.white(`Indexer ${indexerAddress}\n`))
      this.log('As a maker, I intend to:\n')

      const { signerToken, senderToken }: any = await getSideAndTokens(metadata, true)

      const values: any = await get({
        locator: {
          description: 'locator (url)',
          type: 'Locator',
        },
        stakeAmount: {
          description: 'amount to stake',
          type: 'Number',
        },
      })

      const locator = values.locator
      const stakeAmount = values.stakeAmount

      this.log()

      indexerContract.indexes(signerToken.address, senderToken.address, protocol).then(async (index: any) => {
        if (index === ADDRESS_ZERO) {
          this.log(chalk.yellow(`${signerToken.symbol}/${senderToken.symbol} does not exist`))
          this.log(`Create this index with ${chalk.bold('indexer:new')}\n`)
        } else {
          const existingEntry = await new ethers.Contract(index, Index.abi, wallet).getLocator(wallet.address)
          if (existingEntry !== LOCATOR_ZERO) {
            this.log(
              chalk.yellow(`You have an existing intent ${chalk.bold(ethers.utils.parseBytes32String(existingEntry))}`),
            )
            this.log(`First unset the existing intent with ${chalk.bold('indexer:unset')}\n`)
          } else {
            const atomicAmount = utils.getAtomicValue(stakeAmount, stakingTokenAddresses[chainId], metadata)
            new ethers.Contract(stakingTokenAddresses[chainId], IERC20.abi, wallet)
              .balanceOf(wallet.address)
              .then((balance: any) => {
                if (balance.toNumber() < atomicAmount) {
                  this.log(
                    chalk.red('\n\nError ') +
                      `The selected account cannot stake ${stakeAmount} AST. Its balance is ${balance.toNumber() /
                        10 ** 4}.\n`,
                  )
                } else {
                  new ethers.Contract(stakingTokenAddresses[chainId], IERC20.abi, wallet)
                    .allowance(wallet.address, indexerAddress)
                    .then(async (allowance: any) => {
                      if (allowance.lt(atomicAmount.toFixed())) {
                        this.log(chalk.yellow('Staking is not enabled'))
                        this.log(`Enable staking with ${chalk.bold('intent:enable')}\n`)
                      } else {
                        if (
                          await confirm(
                            this,
                            metadata,
                            'setIntent',
                            {
                              signerToken: signerToken.address,
                              senderToken: senderToken.address,
                              protocol: `${protocol} (${chalk.cyan(protocolNames[protocol])})`,
                              locator,
                              stakeAmount: `${atomicAmount} (${chalk.cyan(stakeAmount)})`,
                            },
                            chainId,
                          )
                        ) {
                          const locatorBytes = ethers.utils.formatBytes32String(locator)
                          new ethers.Contract(indexerAddress, Indexer.abi, wallet)
                            .setIntent(
                              signerToken.address,
                              senderToken.address,
                              protocol,
                              atomicAmount.toFixed(),
                              locatorBytes,
                              { gasPrice },
                            )
                            .then(utils.handleTransaction)
                            .catch(utils.handleError)
                        }
                      }
                    })
                }
              })
          }
        }
      })
    } catch (e) {
      cancelled(e)
    }
  }
}
