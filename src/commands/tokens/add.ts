import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { getTable } from 'console.table'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { getTokenList, confirm, cancelled } from '../../lib/prompt'

import { stakingTokenAddresses } from '@airswap/utils'
import { Registry } from '@airswap/libraries'

const IERC20 = require('@openzeppelin/contracts/build/contracts/IERC20.json')

export default class TokensAdd extends Command {
  public static description = 'add supported tokens to the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, TokensAdd.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)
      const url = (
        await registryContract.getServerURLsForStakers([wallet.address])
      )[0]
      if (!url) {
        this.log(chalk.yellow('\nServer URL is not set'))
        this.log(`Set your server URL with ${chalk.bold('registry:url')}\n`)
      } else {
        this.log(chalk.white(`Server URL ${chalk.bold(url)}\n`))
      }

      const alreadySupported = await registryContract.getTokensForStaker(
        wallet.address
      )
      if (alreadySupported.length) {
        this.log(`Currently supporting the following tokens...\n`)
        const result = []
        alreadySupported.map((address) => {
          const token = metadata.byAddress[address.toLowerCase()]
          result.push({
            Symbol: token.symbol,
            Address: token.address,
          })
        })
        this.log(getTable(result))
      }

      const stakingTokenContract = new ethers.Contract(
        stakingTokenAddresses[chainId],
        IERC20.abi,
        wallet
      )
      const allowance = await stakingTokenContract.allowance(
        wallet.address,
        Registry.getAddress(chainId)
      )

      if (allowance.eq(0)) {
        this.log(chalk.yellow('Registry not enabled'))
        this.log(
          `Enable staking on the Registry with ${chalk.bold(
            'registry:approve'
          )}\n`
        )
      } else {
        const tokens: any = await getTokenList(
          metadata,
          'token symbols to activate (comma separated)'
        )
        const tokenAddresses = []
        const tokenLabels = []

        for (const i in tokens) {
          tokenAddresses.push(tokens[i].address)
          tokenLabels.push(`${tokens[i].address} (${tokens[i].symbol})`)
        }

        const supportCost = (await registryContract.supportCost()).toNumber()
        const totalCost = supportCost * tokenAddresses.length

        if (
          await confirm(
            this,
            metadata,
            'addTokens',
            {
              tokens: tokenLabels.join('\n'),
              stake: `${totalCost / 10000} AST`,
            },
            chainId
          )
        ) {
          registryContract
            .addTokens(tokenAddresses, { gasPrice })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
