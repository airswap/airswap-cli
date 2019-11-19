const ethers = require('ethers')
const chalk = require('chalk')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../../constants.js')

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
}

network.select('Unset Intent to Trade', wallet => {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  prompt.get(fields, values => {
    new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      .indexes(values.signerToken, values.senderToken)
      .then(indexAddress => {
        if (indexAddress === '0x0000000000000000000000000000000000000000') {
          console.log(`\n${chalk.yellow('Error')}: Token Pair Not Found\n`)
        } else {
          prompt.confirm('Unset an Intent', values, 'send transaction', () => {
            new ethers.Contract(indexerAddress, Indexer.abi, wallet)
              .unsetIntent(values.signerToken, values.senderToken)
              .then(prompt.handleTransaction)
              .catch(prompt.handleError)
          })
        }
      })
  })
})
