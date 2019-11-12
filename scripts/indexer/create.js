const ethers = require('ethers')
const chalk = require('chalk')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')

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
  prompt.get(fields, values => {
    const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)
    indexerContract.indexes(values.signerToken, values.senderToken).then(index => {
      if (index != ethers.constants.AddressZero) {
        console.log(`\n${chalk.yellow('Error')}: Index already exists`)
        console.log(`You can stake on the Index using ${chalk.bold('yarn indexer:set')}`)
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
