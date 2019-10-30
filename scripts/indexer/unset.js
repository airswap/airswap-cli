const ethers = require('ethers')
const chalk = require('chalk')

const Indexer = require('../../contracts/Indexer.json')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')

const fields = {
  signerToken: {
    description: `Token address of ${chalk.white.bold('signerToken')} (maker side)`,
    type: 'Address',
    default: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
  },
  senderToken: {
    description: `Token address of ${chalk.white.bold('senderToken')} (taker side)`,
    type: 'Address',
    default: '0xc778417e063141139fce010982780140aa0cd5ab',
  },
}

network.select('Unset Intent to Trade', wallet => {
  prompt.get(fields, values => {
    new ethers.Contract(process.env.INDEXER_ADDRESS, Indexer.abi, wallet)
      .indexes(values.signerToken, values.senderToken)
      .then(indexAddress => {
        if (indexAddress === '0x0000000000000000000000000000000000000000') {
          console.log(`\n${chalk.yellow('Error')}: Token Pair Not Found\n`)
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
