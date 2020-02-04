import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { get, getSideAndTokens, confirm, cancelled } from '../../lib/prompt'
import constants from '../../lib/constants.json'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const Index = require('@airswap/indexer/build/contracts/Index.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentSet extends Command {
  static description = 'set an intent'
  async run() {
    try {
      const wallet = await utils.getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, IntentSet.description, chainId)

      let { protocol } = await utils.getConfig(this)
      protocol = protocol || constants.protocols.HTTPS

      const indexerAddress = indexerDeploys[chainId]
      const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      this.log(chalk.white(`Indexer ${indexerAddress}\n`))

      const { signerToken, senderToken }: any = await getSideAndTokens(metadata, true)

      const values: any = await get({
        locator: {
          description: 'locator',
          type: 'Locator',
        },
        stakeAmount: {
          description: 'stakeAmount',
          type: 'Number',
        },
      })

      const locator = values.locator
      const stakeAmount = values.stakeAmount

      this.log()

      indexerContract.indexes(signerToken.addr, senderToken.addr, protocol).then(async (index: any) => {
        if (index === constants.ADDRESS_ZERO) {
          this.log(chalk.yellow(`Pair ${signerToken.name}/${senderToken.name} does not exist`))
          this.log(`Create this pair with ${chalk.bold('indexer:new')}\n`)
        } else {
          const existingEntry = await new ethers.Contract(index, Index.abi, wallet).getLocator(wallet.address)
          if (existingEntry !== constants.LOCATOR_ZERO) {
            this.log(
              chalk.yellow(`You have an existing intent ${chalk.bold(ethers.utils.parseBytes32String(existingEntry))}`),
            )
            this.log(`First unset the existing intent with ${chalk.bold('indexer:unset')}\n`)
          } else {
            const atomicAmount = utils.getAtomicValue(stakeAmount, constants.stakingTokenAddresses[chainId], metadata)
            new ethers.Contract(constants.stakingTokenAddresses[chainId], IERC20.abi, wallet)
              .balanceOf(wallet.address)
              .then((balance: any) => {
                if (balance.toNumber() < atomicAmount) {
                  this.log(
                    chalk.red('\n\nError ') +
                      `The selected account cannot stake ${stakeAmount} AST. Its balance is ${balance.toNumber() /
                        10 ** constants.AST_DECIMALS}.\n`,
                  )
                } else {
                  new ethers.Contract(constants.stakingTokenAddresses[chainId], IERC20.abi, wallet)
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
                              signerToken: signerToken.addr,
                              senderToken: senderToken.addr,
                              protocol: `${protocol} (${chalk.cyan(constants.protocolNames[protocol])})`,
                              locator,
                              stakeAmount: `${atomicAmount} (${chalk.cyan(stakeAmount)})`,
                            },
                            chainId,
                          )
                        ) {
                          const locatorBytes = ethers.utils.formatBytes32String(locator)
                          new ethers.Contract(indexerAddress, Indexer.abi, wallet)
                            .setIntent(
                              signerToken.addr,
                              senderToken.addr,
                              protocol,
                              atomicAmount.toFixed(),
                              locatorBytes,
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
