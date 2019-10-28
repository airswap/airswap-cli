const ethers = require('ethers')
const chalk = require('chalk')

const Indexer = require('../contracts/Indexer.json')
const network = require('./lib/network.js')
const prompt = require('./lib/prompt.js')
const constants = require('./lib/constants.js')

const fields = {
  signerToken: {
    description: `Address of ${chalk.white.bold('signerToken')} to trade`,
    type: 'Address',
  },
  senderToken: {
    description: `Address of ${chalk.white.bold('senderToken')} to trade`,
    type: 'Address',
  },
  count: {
    description: `Number of ${chalk.white.bold('locators')} to return`,
    type: 'Number',
  },
}

network.select('Get Locators', wallet => {
  prompt.get(fields, values => {
    new ethers.Contract(process.env.INDEXER_ADDRESS, Indexer.abi, wallet)
      .getLocators(values.signerToken, values.senderToken, constants.INDEX_HEAD, values.count)
      .then(locators => {
        for (let i = 0; i < locators.length; i++) {
          console.log(`${i + 1}. ${ethers.utils.parseBytes32String(locators[i])}`)
        }
      })
      .catch(prompt.handleError)
  })
})
