const ethers = require('ethers')
const chalk = require('chalk')

const ERC20 = require('../contracts/ERC20.json')
const Indexer = require('../contracts/Indexer.json')

const network = require('./lib/network.js')
const prompt = require('./lib/prompt.js')
const constants = require('./lib/constants.js')

const fields = {
  signerToken: {
    description: `Token address of ${chalk.white.bold('signerToken')} (maker side)`,
    type: 'Address',
  },
  senderToken: {
    description: `Token address of ${chalk.white.bold('senderToken')} (taker side)`,
    type: 'Address',
  },
  locator: {
    description: `Web address of ${chalk.white.bold('your server')} (URL)`,
    type: 'URL',
  },
  stakeAmount: {
    description: `Amount of ${chalk.white.bold('token to stake')} (AST)`,
    type: 'Number',
  },
}

network.select('Set Intent to Trade', wallet => {
  prompt.get(fields, values => {
    const atomicAmount = values.stakeAmount * 10 ** constants.AST_DECIMALS
    new ethers.Contract(constants.stakingTokenAddresses[wallet.provider.network.name], ERC20.abi, wallet)
      .balanceOf(wallet.address)
      .then(balance => {
        if (balance.toNumber() < atomicAmount) {
          console.log(
            colors.red('\r\n\r\nError ') +
              `The selected account cannot stake ${values.stakeAmount} AST. Its balance is ${balance.toNumber() /
                10 ** constants.AST_DECIMALS}.\r\n`
          )
        } else {
          prompt.confirm('Set an Intent', 'send transaction', values, () => {
            const locatorBytes = ethers.utils.formatBytes32String(values.locator)
            new ethers.Contract(process.env.INDEXER_ADDRESS, Indexer.abi, wallet)
              .setIntent(values.signerToken, values.senderToken, atomicAmount, locatorBytes)
              .then(prompt.handleTransaction)
              .catch(prompt.handleError)
          })
        }
      })
  })
})
