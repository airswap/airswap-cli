const dotenv = require('dotenv')
const ethers = require('ethers')
const jayson = require('jayson')
const chalk = require('chalk')
const cliSpinners = require('cli-spinners')
const Spinnies = require('spinnies')

const { orders } = require('@airswap/order-utils')

const constants = require('../constants.js')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const Indexer = require('../../contracts/Indexer.json')

dotenv.config()

const allFields = {
  signerParam: {
    description: chalk.white('Amount to signerSide'),
    type: 'Number',
    default: 100,
  },
  senderParam: {
    description: chalk.white('Amount to senderSide'),
    type: 'Number',
    default: 100,
  },
  signerToken: {
    description: chalk.white('Token to signerSide'),
    type: 'Address',
    default: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
  },
  senderToken: {
    description: chalk.white('Token to senderSide'),
    type: 'Address',
    default: '0xc778417e063141139fce010982780140aa0cd5ab',
  },
}

function getFields(fields, signerSide, senderSide) {
  const retVal = {}
  for (var i = 0; i < fields.length; i++) {
    retVal[fields[i]] = Object.assign({}, allFields[fields[i]])
    retVal[fields[i]].description = retVal[fields[i]].description.replace(/signerSide/, signerSide)
    retVal[fields[i]].description = retVal[fields[i]].description.replace(/senderSide/, senderSide)
  }
  return retVal
}

function indexerCall(wallet, callback) {
  prompt.get(getFields(['signerToken', 'senderToken'], 'buy', 'sell'), values => {
    new ethers.Contract(process.env.INDEXER_ADDRESS, Indexer.abi, wallet)
      .getLocators(values.signerToken, values.senderToken, constants.INDEX_HEAD, constants.MAX_LOCATORS)
      .then(result => {
        callback(result, values)
      })
  })
}

function peerCall(locator, method, values, callback) {
  const client = jayson.client.http(locator)
  client.request(method, values, function(err, error, quote) {
    if (err) {
      callback(`Connection error to ${locator}`)
    } else {
      if (error) {
        callback(`\n${chalk.yellow('Maker Error')}: ${error.message}\n`)
      } else if (!orders.isValidQuote(quote)) {
        console.log(`\n${chalk.yellow('Got a Malformed Quote')}`)
        console.log(quote)
      } else {
        callback(null, quote)
      }
    }
  })
}

module.exports = {
  getBuyQuote: (wallet, locator) => {
    prompt.get(getFields(['signerToken', 'senderToken', 'signerParam'], 'sell', 'buy'), values => {
      peerCall(locator, 'getSenderSideQuote', values, (error, result) => {
        console.log(`\nQuote from ${chalk.white(locator)} ${result.sender.param}`)
      })
    })
  },
  getBuyQuoteAll: wallet => {
    indexerCall(wallet, (locators, values) => {
      const spinnies = new Spinnies({ spinner: cliSpinners.dots, succeedColor: chalk.white })
      prompt.get(getFields(['signerParam'], 'buy', 'sell'), values2 => {
        console.log()
        for (let i = 0; i < locators.length; i++) {
          locators[i] = ethers.utils.parseBytes32String(locators[i])
          if (locators[i]) {
            spinnies.add(locators[i], { text: `Querying ${chalk.white(locators[i])}` })
            peerCall(locators[i], 'getSenderSideQuote', Object.assign(values, values2), (error, result) => {
              if (error) {
                spinnies.fail(locators[i], { text: error })
              } else {
                spinnies.succeed(locators[i], { text: `Quote from ${chalk.white(locators[i])} ${result.sender.param}` })
              }
            })
          }
        }
      })
    })
  },
}
