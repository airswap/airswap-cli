import { Command } from '@oclif/command'
import { ethers } from 'ethers'
import { handleTransaction, handleError } from '../../utils'
import { cli } from 'cli-ux'
import setup from '../../setup'
import { confirmTransaction } from '../../utils'

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const constants = require('../../constants.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

export default class IntentEnable extends Command {
  static description = 'Enable staking on the indexer'
  async run() {
    setup(this, IntentEnable.description, async (wallet: any, metadata: any) => {
      const indexerAddress = indexerDeploys[wallet.provider.network.chainId]

      confirmTransaction(
        this,
        'approve',
        {
          token: `${constants.stakingTokenAddresses[wallet.provider.network.chainId]} (AST)`,
          spender: `${indexerAddress} (Indexer)`,
        },
        () => {
          new ethers.Contract(constants.stakingTokenAddresses[wallet.provider.network.chainId], IERC20.abi, wallet)
            .approve(indexerAddress, constants.APPROVAL_AMOUNT)
            .then(handleTransaction)
            .catch(handleError)
        },
      )
    })
  }
}
