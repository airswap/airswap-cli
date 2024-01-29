import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as utils from '../../lib/utils'
import { getWallet } from '../../lib/wallet'
import { get, confirm, cancelled } from '../../lib/prompt'
import { toDecimalString } from '@airswap/utils'

const wethDeploys = require('@airswap/wrapper/deploys-weth.js')
const WETH9 = require('@airswap/wrapper/build/contracts/WETH9.sol/WETH9.json')

export default class IntentUnset extends Command {
  public static description = 'deposit eth to weth'
  public async run() {
    try {
      const wallet = await getWallet(this, true)
      const chainId = (await wallet.provider.getNetwork()).chainId
      const metadata = await utils.getMetadata(this, chainId)
      const gasPrice = await utils.getGasPrice(this)
      utils.displayDescription(this, IntentUnset.description, chainId)

      const WETH = metadata.byAddress[wethDeploys[chainId]]
      if (!WETH) {
        throw new Error('Wrapped token not found for the selected chain.')
      }

      const balance = await wallet.provider.getBalance(wallet.address)
      const balanceDecimal = toDecimalString(
        balance.toString(),
        metadata.byAddress[WETH.address].decimals
      )
      this.log(`ETH available to deposit: ${chalk.bold(balanceDecimal)}`)
      this.log(
        chalk.gray('Some ETH must be saved to execute the transaction.\n')
      )

      const { amount }: any = await get({
        amount: {
          description: 'amount to deposit',
          type: 'Number',
        },
      })
      const atomicAmount = utils.getAtomicValue(amount, WETH.address, metadata)

      if (atomicAmount.eq(0)) {
        cancelled('Amount must be greater than zero.')
      } else if (balance.lt(atomicAmount.toString())) {
        cancelled('Insufficient balance.')
      } else {
        this.log()
        if (
          await confirm(
            this,
            metadata,
            'deposit',
            {
              '[value]': `${atomicAmount} (${chalk.cyan(amount)})`,
            },
            chainId
          )
        ) {
          new ethers.Contract(WETH.address, WETH9.abi, wallet)
            .deposit({
              value: ethers.BigNumber.from(atomicAmount.toFixed()),
              gasPrice,
            })
            .then(utils.handleTransaction)
            .catch(utils.handleError)
        }
      }
    } catch (e) {
      cancelled(e)
    }
  }
}
