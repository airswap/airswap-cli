const ethers = require('ethers')
const chalk = require('chalk')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../../constants.js')

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

const fields = {
  signerToken: {
    description: `Address of ${chalk.white.bold('signerToken')} to query`,
    type: 'Address',
    default: constants.rinkebyTokens.DAI,
  },
  senderToken: {
    description: `Address of ${chalk.white.bold('senderToken')} to query`,
    type: 'Address',
    default: constants.rinkebyTokens.WETH,
  },
  count: {
    description: `Number of ${chalk.white.bold('locators')} to return`,
    type: 'Number',
    default: 10,
  },
}

network.select('Get Locators', wallet => {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  prompt.get(fields, values => {
    new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      .getLocators(values.signerToken, values.senderToken, constants.INDEX_HEAD, values.count)
      .then(result => {
        if (!result.locators.length) {
          console.log('No locators found.')
        } else {
          for (let i = 0; i < result.locators.length; i++) {
            try {
              console.log(`${i + 1}. ${ethers.utils.parseBytes32String(result.locators[i])} (${result.scores[i]})`)
            } catch (e) {
              console.log(`${i + 1}. Could not parse (${result.locators[i]})`)
            }
          }
        }
      })
      .catch(prompt.handleError)
  })
})
