const ethers = require('ethers')
const chalk = require('chalk')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../../constants.js')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

const fields = {
  signerToken: {
    description: `Token address of ${chalk.white.bold('signerToken')} (maker side)`,
    type: 'Address',
    default: constants.rinkebyTokens.DAI,
  },
  senderToken: {
    description: `Token address of ${chalk.white.bold('senderToken')} (taker side)`,
    type: 'Address',
    default: constants.rinkebyTokens.WETH,
  },
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

network.select('Set Intent to Trade', wallet => {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  console.log(chalk.white(`Indexer ${indexerAddress}\n`))
  const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
  prompt.get(fields, values => {
    indexerContract.indexes(values.signerToken, values.senderToken).then(index => {
      if (index === constants.ADDRESS_ZERO) {
        console.log(`\n${chalk.yellow('Error')}: Index does not exist`)
        console.log(`You can create one for this token pair using ${chalk.bold('yarn indexer:create')}\n`)
      } else {
        const atomicAmount = values.stakeAmount * 10 ** constants.AST_DECIMALS
        new ethers.Contract(constants.stakingTokenAddresses[wallet.provider.network.chainId], IERC20.abi, wallet)
          .balanceOf(wallet.address)
          .then(balance => {
            if (balance.toNumber() < atomicAmount) {
              console.log(
                chalk.red('\n\nError ') +
                  `The selected account cannot stake ${values.stakeAmount} AST. Its balance is ${balance.toNumber() /
                    10 ** constants.AST_DECIMALS}.\n`,
              )
            } else {
              new ethers.Contract(constants.stakingTokenAddresses[wallet.provider.network.chainId], IERC20.abi, wallet)
                .allowance(wallet.address, indexerAddress)
                .then(allowance => {
                  if (allowance.lt(atomicAmount)) {
                    console.log(`\n${chalk.yellow('Error')}: Staking not Enabled`)
                    console.log(`Run the ${chalk.bold('yarn indexer:enable')} script to enable.\n`)
                  } else {
                    new ethers.Contract(indexerAddress, Indexer.abi, wallet)
                      .indexes(values.signerToken, values.senderToken)
                      .then(indexAddress => {
                        if (indexAddress === constants.NULL_ADDRESS) {
                          console.log(`\n${chalk.yellow('Error')}: Token Pair Not Found`)
                          console.log(`Run the ${chalk.bold('yarn indexer:create')} script with your token pair.\n`)
                        } else {
                          prompt.confirm('Set an Intent', values, 'send transaction', () => {
                            const locatorBytes = ethers.utils.formatBytes32String(values.locator)
                            new ethers.Contract(indexerAddress, Indexer.abi, wallet)
                              .setIntent(values.signerToken, values.senderToken, atomicAmount, locatorBytes)
                              .then(prompt.handleTransaction)
                              .catch(prompt.handleError)
                          })
                        }
                      })
                  }
                })
            }
          })
      }
    })
  })
})
