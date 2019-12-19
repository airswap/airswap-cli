const ethers = require('ethers')
const chalk = require('chalk')
const ora = require('ora')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../../constants.js')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

const tokenAmounts = require('../../token-prices.json')

const fields = {
  locator: {
    description: `Web address of ${chalk.white.bold('your server')} (URL)`,
    type: 'URL',
    default: `http://${network.getIPAddress()}:${constants.DEFAULT_PORT}`,
  },
  stakeAmount: {
    description: `Amount of ${chalk.white.bold('token to stake')} (AST)`,
    type: 'Number',
    default: 0,
  },
}

async function setIntent(signerToken, senderToken, locator, stakeAmount, wallet) {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  console.log(chalk.white(`Indexer ${indexerAddress}\n`))

  const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
  const index = await indexerContract.indexes(signerToken, senderToken, constants.PROTOCOL_CODE)
  if (index == constants.ADDRESS_ZERO) {
    console.log(`\n${chalk.yellow('Error')}: Index does not exist`)
    console.log(`You can create one for this token pair using ${chalk.bold('yarn indexer:create')}\n`)
    return
  }

  const atomicAmount = stakeAmount * 10 ** constants.AST_DECIMALS
  const astContract = new ethers.Contract(
    constants.stakingTokenAddresses[wallet.provider.network.chainId],
    IERC20.abi,
    wallet,
  )

  const balance = await astContract.balanceOf(wallet.address)
  if (balance.toNumber() < atomicAmount) {
    console.log(
      chalk.red('\n\nError ') +
      `The selected account cannot stake ${stakeAmount} AST. Its balance is ${balance.toNumber() /
      10 ** constants.AST_DECIMALS}.\n`,
    )
    return
  }

  const allowance = await astContract.allowance(wallet.address, indexerAddress)
  if (allowance.lt(atomicAmount)) {
    console.log(`\n${chalk.yellow('Error')}: Staking not Enabled`)
    console.log(`Run the ${chalk.bold('yarn indexer:enable')} script to enable.\n`)
    return
  }

  const locatorBytes = ethers.utils.formatBytes32String(locator)
  return indexerContract.setIntent(signerToken, senderToken, constants.PROTOCOL_CODE, atomicAmount, locatorBytes)
}

network.select('Set Intent to Trade', async wallet => {
  prompt.get(fields, async values => {
    for (const firstToken in tokenAmounts) {
      for (const secondToken in tokenAmounts[firstToken]) {
        const tx = await setIntent(firstToken, secondToken, values.locator, values.stakeAmount, wallet)

        if (tx != null) {
          console.log(chalk.underline(`https://${constants.etherscanDomains[tx.chainId]}/tx/${tx.hash}\n`))
          const spinner = ora(`Mining transaction (${constants.chainNames[tx.chainId]})...`).start()
          const txResp = await tx.wait(constants.DEFAULT_CONFIRMATIONS)
          spinner.succeed(`Transaction complete (${constants.DEFAULT_CONFIRMATIONS} confirmations)`)
        }
      }
    }
  })
})
