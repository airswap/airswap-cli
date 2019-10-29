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
}

network.select('Unset Intent to Trade', wallet => {
  prompt.get(fields, values => {
    new ethers.Contract(process.env.INDEXER_ADDRESS, Indexer.abi, wallet)
      .indexes(values.signerToken, values.senderToken)
      .then(indexAddress => {
        if (indexAddress === '0x0000000000000000000000000000000000000000') {
          console.log(`\n${chalk.yellow('Error')}: Token Pair Not Found`)
          console.log(`Nothing to unstake for this token pair.\n`)
        } else {
          prompt.confirm('Unset an Intent', values, 'send transaction', () => {
            new ethers.Contract(process.env.INDEXER_ADDRESS, Indexer.abi, wallet)
              .unsetIntent(values.signerToken, values.senderToken)
              .then(prompt.handleTransaction)
              .catch(prompt.handleError)
          })
        }
      })
  })
})
