const ethers = require('ethers')
const chalk = require('chalk')

const Indexer = require('../../contracts/Indexer.json')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')

const fields = {
  signerToken: {
    description: `Address of ${chalk.white.bold('signerToken')} to trade`,
    type: 'Address',
  },
  senderToken: {
    description: `Address of ${chalk.white.bold('senderToken')} to trade`,
    type: 'Address',
  },
}

network.select('Create an Index', wallet => {
  prompt.get(fields, values => {
    prompt.confirm('This will create a token pair Index on the Indexer.', values, 'send transaction', () => {
      new ethers.Contract(process.env.INDEXER_ADDRESS, Indexer.abi, wallet)
        .createIndex(values.signerToken, values.senderToken)
        .then(prompt.handleTransaction)
        .catch(prompt.handleError)
    })
  })
})
