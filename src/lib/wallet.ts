import chalk from 'chalk'
import { ethers } from 'ethers'
import { getChainId, getProvider } from './utils'
import BigNumber from 'bignumber.js'

export function requireKeytar() {
  try {
    return require('keytar')
  } catch (e) {
    throw new Error(
      'Cannot access your account because dependencies are missing.\n' +
        'If you are on Linux, try installing libsecret-1-dev (Debian, Ubuntu etc.) or ' +
        'libsecret-devel (RedHat, Fedora etc.) and then reinstalling AirSwap CLI.',
    )
  }
}

import { chainCurrencies } from '@airswap/constants'

export async function getWallet(ctx: any, requireBalance?: boolean) {
  const keytar = requireKeytar()
  const account = await keytar.getPassword('airswap-cli', 'private-key')

  if (!account) {
    throw new Error(`No account set. Set one with ${chalk.bold('account:import')}`)
  } else {
    const chainId = await getChainId(ctx)
    const selectedCurrency = chainCurrencies[chainId]
    const signerPrivateKey = Buffer.from(account, 'hex')
    const provider = await getProvider(ctx)
    const wallet = new ethers.Wallet(signerPrivateKey, provider)

    const balance = await provider.getBalance(wallet.address)
    if (requireBalance && balance.eq(0)) {
      throw new Error(`Current account must hold ${selectedCurrency} to use this command.`)
    } else {
      const balanceLabel = new BigNumber(balance.toString()).dividedBy(new BigNumber(10).pow(18)).toFixed()
      ctx.log(chalk.gray(`Account ${wallet.address} (${balanceLabel} ${selectedCurrency})`))
      return wallet
    }
  }
}
