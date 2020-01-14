import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import {
  getWallet,
  getMetadata,
  displayDescription,
  promptTokens,
  confirmTransaction,
  handleTransaction,
  handleError,
} from '../../lib/utils'

const constants = require('../../lib/constants.json')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentSet extends Command {
  static description = 'set an intent'
  async run() {
    const wallet = await getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await getMetadata(this, chainId)
    displayDescription(this, IntentSet.description, chainId)

    const indexerAddress = indexerDeploys[chainId]
    const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    this.log(chalk.white(`Indexer ${indexerAddress}\n`))

    const { first, second } = await promptTokens(metadata)
    const locator = await cli.prompt('locator')
    const stakeAmount = await cli.prompt('stakeAmount')

    this.log()

    indexerContract.indexes(first.addr, second.addr, constants.protocols.HTTP_LATEST).then((index: any) => {
      if (index === constants.ADDRESS_ZERO) {
        this.log(chalk.yellow(`Pair ${first.name}/${second.name} does not exist`))
        this.log(`Create this pair with ${chalk.bold('new:pair')}\n`)
      } else {
        const atomicAmount = stakeAmount * 10 ** constants.AST_DECIMALS
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
                  if (allowance.lt(atomicAmount)) {
                    this.log(chalk.yellow('Staking is not enabled'))
                    this.log(`Enable staking with ${chalk.bold('intent:enable')}\n`)
                  } else {
                    confirmTransaction(
                      this,
                      metadata,
                      'setIntent',
                      {
                        signerToken: `${first.addr} (${first.name})`,
                        senderToken: `${second.addr} (${second.name})`,
                        protocol: `${constants.protocols.HTTP_LATEST} (HTTPS)`,
                        locator,
                        stakeAmount: atomicAmount,
                      },
                      () => {
                        const locatorBytes = ethers.utils.formatBytes32String(locator)
                        new ethers.Contract(indexerAddress, Indexer.abi, wallet)
                          .setIntent(
                            first.addr,
                            second.addr,
                            constants.protocols.HTTP_LATEST,
                            atomicAmount,
                            locatorBytes,
                          )
                          .then(handleTransaction)
                          .catch(handleError)
                      },
                    )
                  }
                })
            }
          })
      }
    })
  }
}
