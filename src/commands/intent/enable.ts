import chalk from 'chalk'
import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import { handleTransaction, handleError } from '../../lib/utils'
import * as utils from '../../lib/utils'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const constants = require('../../lib/constants.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentEnable extends Command {
  static description = 'enable staking on the indexer'
  async run() {
    const wallet = await utils.getWallet(this)
    const chainId = (await wallet.provider.getNetwork()).chainId
    const metadata = await utils.getMetadata(this, chainId)
    utils.displayDescription(this, IntentEnable.description, chainId)

    const indexerAddress = indexerDeploys[chainId]
    const stakingTokenContract = new ethers.Contract(constants.stakingTokenAddresses[chainId], IERC20.abi, wallet)

    const allowance = await stakingTokenContract.allowance(wallet.address, indexerAddress)

    if (!allowance.eq(0)) {
      this.log(chalk.yellow('Staking already enabled'))
      this.log(`Set intent with ${chalk.bold('intent:set')}\n`)
    } else {
      utils.confirmTransaction(
        this,
        metadata,
        'approve',
        {
          token: `${constants.stakingTokenAddresses[chainId]} (AST)`,
          spender: `${indexerAddress} (Indexer)`,
        },
        () => {
          return true
          stakingTokenContract
            .approve(indexerAddress, constants.APPROVAL_AMOUNT)
            .then(handleTransaction)
            .catch(handleError)
        },
      )
    }
  }
}
