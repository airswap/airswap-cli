const ethers = require('ethers')
const chalk = require('chalk')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../../constants.js')

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

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
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  console.log(chalk.white(`Indexer ${indexerAddress}\n`))
  prompt.get(fields, values => {
    const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    indexerContract.indexes(values.signerToken, values.senderToken).then(index => {
      if (index !== constants.ADDRESS_ZERO) {
        console.log(`\n${chalk.yellow('Error')}: Index already exists`)
        console.log(`You can stake on this index using ${chalk.bold('yarn indexer:set')}\n`)
      } else {
        prompt.confirm('This will create a new Index for a token pair.', values, 'send transaction', () => {
          new ethers.Contract(indexerAddress, Indexer.abi, wallet)
            .createIndex(values.signerToken, values.senderToken)
            .then(prompt.handleTransaction)
            .catch(prompt.handleError)
        })
      }
    })
  })
})
