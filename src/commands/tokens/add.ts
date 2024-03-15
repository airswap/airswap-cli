import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { getTable } from 'console.table'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { getTokenList, confirm, cancelled } from '../../lib/prompt'
import { Registry } from '@airswap/libraries'
const IERC20 = require('@airswap/utils/build/src/abis/ERC20.json')

export default class TokensAdd extends Command {
  public static description = 'add supported tokens to the registry'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      utils.displayDescription(this, TokensAdd.description, chainId)

      this.log(chalk.white(`Registry ${Registry.getAddress(chainId)}\n`))

      const registryContract = Registry.getContract(wallet, chainId)
      const stakingTokenContract = new ethers.Contract(
        await registryContract.stakingToken(),
        IERC20.abi,
        wallet
      )
      const allowance = await stakingTokenContract.allowance(
        wallet.address,
        Registry.getAddress(chainId)
      )

      if (allowance.eq(0)) {
        this.log(chalk.yellow('Registry is not approved'))
        this.log(
          `Enable usage of the registry with ${chalk.bold(
            'registry:approve'
          )}\n`
        )
        process.exit(0)
      }

      const url = (
        await registryContract.getServerURLsForStakers([wallet.address])
      )[0]
      if (!url) {
        this.log(chalk.yellow('Server URL is not set'))
        this.log(`Set your server URL with ${chalk.bold('registry:url')}\n`)
        process.exit(0)
      } else {
        this.log(chalk.white(`Server URL ${chalk.bold(url)}\n`))
      }

      const activatedProtocols = await registryContract.getProtocolsForStaker(
        wallet.address
      )
      if (!activatedProtocols.length) {
        this.log(chalk.yellow('No activated protocols'))
        this.log(
          `Add protocols you support with ${chalk.bold('protocols:add')}\n`
        )
        process.exit(0)
      }

      const activatedTokens = await registryContract.getTokensForStaker(
        wallet.address
      )
      if (activatedTokens.length) {
        this.log(`Tokens currently activated:\n`)
        const result = []
        activatedTokens.map((address) => {
          const token = metadata.byAddress[address.toLowerCase()]
          result.push({
            address: token ? token.address : address,
            symbol: token ? token.symbol : '?',
          })
        })
        this.log(getTable(result))
      }
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
      const stakingToken =
        metadata.byAddress[stakingTokenContract.address.toLowerCase()]
      const supportCost = await registryContract.supportCost()
      const totalCost = supportCost.mul(tokenAddresses.length)
      const balance = await stakingTokenContract.balanceOf(wallet.address)
      if (balance.lt(totalCost)) {
        this.log(
          `\nInsufficient balance in staking token ${stakingToken.symbol} (${stakingToken.address})\n`
        )
        this.log(
          `· Balance: ${ethers.utils
            .formatUnits(balance.toString(), stakingToken.decimals)
            .toString()}`
        )
        this.log(
          `· Required: ${ethers.utils
            .formatUnits(totalCost.toString(), stakingToken.decimals)
            .toString()}\n`
        )
      } else {
        if (
          await confirm(
            this,
            metadata,
            'addTokens',
            {
              tokens: tokenLabels.join('\n'),
              stake: `${ethers.utils
                .formatUnits(totalCost.toString(), stakingToken.decimals)
                .toString()} ${stakingToken.symbol}`,
            },
            chainId
          )
        ) {
          registryContract
            .addTokens(tokenAddresses)
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
