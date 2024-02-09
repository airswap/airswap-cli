import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { getTokenList, confirm, cancelled } from '../../lib/prompt'
import { getTable } from 'console.table'
import { Registry } from '@airswap/libraries'
const IERC20 = require('@openzeppelin/contracts/build/contracts/IERC20.json')

export default class TokensRemove extends Command {
  public static description = 'remove supported tokens from the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, TokensRemove.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)

      const activatedTokens = await registryContract.getTokensForStaker(
        wallet.address
      )
      if (activatedTokens.length) {
        this.log(`Tokens currently activated:\n`)
        const result = []
        activatedTokens.map((address) => {
          const token = metadata.byAddress[address.toLowerCase()]
          result.push({
            symbol: token.symbol,
            address: token.address,
          })
        })
        this.log(getTable(result))
      } else {
        this.log(chalk.yellow('No activated tokens'))
        this.log(`Add tokens you support with ${chalk.bold('tokens:add')}\n`)
        process.exit(0)
      }

      const stakingTokenContract = new ethers.Contract(
        await registryContract.stakingToken(),
        IERC20.abi,
        wallet
      )
      const tokens: any = await getTokenList(
        metadata,
        'tokens to deactivate (comma separated)'
      )
      const tokenAddresses = []
      const tokenLabels = []

      for (const i in tokens) {
        tokenAddresses.push(tokens[i].address)
        tokenLabels.push(`${tokens[i].address} (${tokens[i].symbol})`)
      }
      const stakingToken =
        metadata.byAddress[stakingTokenContract.address.toLowerCase()]
      const supportCost = (await registryContract.supportCost()).toNumber()
      const totalCost = supportCost * tokenAddresses.length

      if (
        await confirm(
          this,
          metadata,
          'removeTokens',
          {
            tokens: tokenLabels.join('\n'),
            unstake: `${ethers.utils
              .formatUnits(totalCost.toString(), stakingToken.decimals)
              .toString()} ${stakingToken.symbol}`,
          },
          chainId
        )
      ) {
        registryContract
          .removeTokens(tokenAddresses)
          .then(utils.handleTransaction)
          .catch(utils.handleError)
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
