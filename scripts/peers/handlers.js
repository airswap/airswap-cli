const dotenv = require('dotenv')
const ethers = require('ethers')
const jayson = require('jayson')
const chalk = require('chalk')
const cliSpinners = require('cli-spinners')
const Spinnies = require('spinnies')
const constants = require('../../constants.js')
const prompt = require('../lib/prompt.js')

const { orders } = require('@airswap/order-utils')
const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

dotenv.config()

const allFields = {
  signerAmount: {
    description: chalk.white('Amount to signerSide'),
    type: 'Number',
    default: 100,
  },
  senderAmount: {
    description: chalk.white('Amount to senderSide'),
    type: 'Number',
    default: 100,
  },
  signerToken: {
    description: chalk.white('Token to signerSide'),
    type: 'Address',
    default: constants.rinkebyTokens.DAI,
  },
  senderToken: {
    description: chalk.white('Token to senderSide'),
    type: 'Address',
    default: constants.rinkebyTokens.WETH,
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

function indexerCall(wallet, signerSide, senderSide, callback) {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  prompt.get(getFields(['signerToken', 'senderToken'], signerSide, senderSide), values => {
    new ethers.Contract(indexerAddress, Indexer.abi, wallet)
      .getLocators(
        values.signerToken,
        values.senderToken,
        constants.PROTOCOL_CODE,
        constants.INDEX_HEAD,
        constants.MAX_LOCATORS,
      )
      .then(result => {
        callback(result, values)
      })
  })
}

function peerCall(locator, method, values, validator, callback) {
  let client
  if (locator.includes('http://')) {
    client = jayson.client.http(locator)
  } else if (locator.includes('https://')) {
    client = jayson.client.https(locator)
  } else {
    client = jayson.client.https(`https://${locator}`)
  }

  client.request(method, values, function(err, error, quote) {
    if (err) {
      callback(`\n${chalk.yellow('Connection Error')}: ${locator} \n ${err}`)
    } else {
      if (error) {
        callback(`\n${chalk.yellow('Maker Error')}: ${error.message}\n`)
      } else if (!orders[validator](quote)) {
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
    prompt.get(getFields(['signerToken', 'senderToken', 'signerAmount'], 'buy', 'pay'), values => {
      peerCall(locator, 'getSenderSideQuote', values, 'isValidQuote', (error, result) => {
        if (error) {
          console.log(error)
        } else {
          prompt.confirm('Got a Quote', {
            buy: `${chalk.bold(result.signer.amount)} ${result.signer.token}`,
            pay: `${chalk.bold(result.sender.amount)} ${result.sender.token}`,
            price: chalk.bold(result.sender.amount / result.signer.amount),
          })
        }
      })
    })
  },
  getBuyQuoteAll: wallet => {
    indexerCall(wallet, 'buy', 'pay', (result, values) => {
      const spinnies = new Spinnies({
        spinner: cliSpinners.dots,
        succeedColor: chalk.white,
      })
      prompt.get(getFields(['signerAmount'], 'buy', 'buy'), values2 => {
        console.log()
        let hasAtLeastOne = false
        const locators = result.locators
        for (let i = 0; i < locators.length; i++) {
          try {
            locators[i] = ethers.utils.parseBytes32String(locators[i])
          } catch (e) {
            console.log(`Could not parse (${locators[i]})`)
            locators[i] = false
          }
          if (locators[i]) {
            hasAtLeastOne = true
            spinnies.add(locators[i], {
              text: `Querying ${chalk.white(locators[i])}`,
            })
            peerCall(
              locators[i],
              'getSenderSideQuote',
              Object.assign(values, values2),
              'isValidQuote',
              (error, result) => {
                if (error) {
                  spinnies.fail(locators[i], { text: error })
                } else {
                  spinnies.succeed(locators[i], {
                    text:
                      'Quote ' +
                      chalk.white(
                        `from ${chalk.underline(locators[i])} (cost: ${chalk.bold(
                          result.sender.amount,
                        )}, price: ${chalk.bold(result.sender.amount / result.signer.amount)})`,
                      ),
                  })
                }
              },
            )
          }
        }
        if (!hasAtLeastOne) {
          console.log('\nNo peers found.\n')
        }
      })
    })
  },
  getSellQuote: (wallet, locator) => {
    prompt.get(getFields(['signerToken', 'senderToken', 'senderAmount'], 'sell', 'sell'), values => {
      peerCall(locator, 'getSignerSideQuote', values, 'isValidQuote', (error, result) => {
        if (error) {
          console.log(error)
        } else {
          prompt.confirm('Got a Quote', {
            sell: `${chalk.bold(result.sender.amount)} ${result.sender.token}`,
            for: `${chalk.bold(result.signer.amount)} ${result.signer.token}`,
            price: chalk.bold(result.signer.amount / result.sender.amount),
          })
        }
      })
    })
  },
  getSellQuoteAll: wallet => {
    indexerCall(wallet, 'sell', 'pay', (result, values) => {
      const spinnies = new Spinnies({
        spinner: cliSpinners.dots,
        succeedColor: chalk.white,
      })
      prompt.get(getFields(['senderAmount'], 'sell', 'sell'), values2 => {
        console.log()
        let hasAtLeastOne = false
        const locators = result.locators
        for (let i = 0; i < locators.length; i++) {
          try {
            locators[i] = ethers.utils.parseBytes32String(locators[i])
          } catch (e) {
            console.log(`Could not parse (${locators[i]})`)
            locators[i] = false
          }
          if (locators[i]) {
            hasAtLeastOne = true
            spinnies.add(locators[i], {
              text: `Querying ${chalk.white(locators[i])}`,
            })
            peerCall(
              locators[i],
              'getSignerSideQuote',
              Object.assign(values, values2),
              'isValidQuote',
              (error, result) => {
                if (error) {
                  spinnies.fail(locators[i], { text: error })
                } else {
                  spinnies.succeed(locators[i], {
                    text:
                      'Quote ' +
                      chalk.white(
                        `from ${chalk.underline(locators[i])} (get: ${chalk.bold(
                          result.signer.amount,
                        )}, price: ${chalk.bold(result.signer.amount / result.sender.amount)})`,
                      ),
                  })
                }
              },
            )
          }
        }
        if (!hasAtLeastOne) {
          console.log('\nNo peers found.\n')
        }
      })
    })
  },
  getBuyOrder: (wallet, locator) => {
    prompt.get(getFields(['signerToken', 'senderToken', 'signerAmount'], 'buy', 'pay'), values => {
      peerCall(
        locator,
        'getSenderSideOrder',
        Object.assign(values, { senderWallet: wallet.address }),
        'isValidOrder',
        (error, result) => {
          if (error) {
            console.log(error)
          } else {
            prompt.confirm('Got an Order', {
              buy: `${chalk.bold(result.signer.amount)} ${result.signer.token}`,
              pay: `${chalk.bold(result.sender.amount)} ${result.sender.token}`,
              price: chalk.bold(result.sender.amount / result.signer.amount),
              expiry: chalk.green(new Date(result.expiry * 1000).toLocaleTimeString()),
            })
          }
        },
      )
    })
  },
  getBuyOrderAll: wallet => {
    indexerCall(wallet, 'buy', 'pay', (result, values) => {
      const spinnies = new Spinnies({
        spinner: cliSpinners.dots,
        succeedColor: chalk.white,
      })
      prompt.get(getFields(['signerAmount'], 'buy', 'buy'), values2 => {
        console.log()
        let hasAtLeastOne = false
        const locators = result.locators
        for (let i = 0; i < locators.length; i++) {
          try {
            locators[i] = ethers.utils.parseBytes32String(locators[i])
          } catch (e) {
            console.log(`Could not parse (${locators[i]})`)
            locators[i] = false
          }
          if (locators[i]) {
            hasAtLeastOne = true
            spinnies.add(locators[i], {
              text: `Querying ${chalk.white(locators[i])}`,
            })
            peerCall(
              locators[i],
              'getSenderSideOrder',
              Object.assign(Object.assign(values, values2, { senderWallet: wallet.address })),
              'isValidOrder',
              (error, result) => {
                if (error) {
                  spinnies.fail(locators[i], { text: error })
                } else {
                  spinnies.succeed(locators[i], {
                    text:
                      'Order ' +
                      chalk.white(
                        `from ${chalk.underline(locators[i])} (cost: ${chalk.bold(
                          result.sender.amount,
                        )}, price: ${chalk.bold(result.sender.amount / result.signer.amount)}, expiry: ${chalk.green(
                          new Date(result.expiry * 1000).toLocaleTimeString(),
                        )})`,
                      ),
                  })
                }
              },
            )
          }
        }
        if (!hasAtLeastOne) {
          console.log('\nNo peers found.\n')
        }
      })
    })
  },
  getSellOrder: (wallet, locator) => {
    prompt.get(getFields(['signerToken', 'senderToken', 'senderAmount'], 'sell', 'sell'), values => {
      peerCall(
        locator,
        'getSignerSideOrder',
        Object.assign(values, { senderWallet: wallet.address }),
        'isValidOrder',
        (error, result) => {
          if (error) {
            console.log(error)
          } else {
            prompt.confirm('Got an Order', {
              sell: `${chalk.bold(result.sender.amount)} ${result.sender.token}`,
              for: `${chalk.bold(result.signer.amount)} ${result.signer.token}`,
              price: chalk.bold(result.signer.amount / result.sender.amount),
              expiry: chalk.green(new Date(result.expiry * 1000).toLocaleTimeString()),
            })
          }
        },
      )
    })
  },
  getSellOrderAll: wallet => {
    indexerCall(wallet, 'sell', 'pay', (result, values) => {
      const spinnies = new Spinnies({
        spinner: cliSpinners.dots,
        succeedColor: chalk.white,
      })
      prompt.get(getFields(['senderAmount'], 'sell', 'sell'), values2 => {
        console.log()
        let hasAtLeastOne = false
        const locators = result.locators
        for (let i = 0; i < locators.length; i++) {
          try {
            locators[i] = ethers.utils.parseBytes32String(locators[i])
          } catch (e) {
            console.log(`Could not parse (${locators[i]})`)
            locators[i] = false
          }
          if (locators[i]) {
            hasAtLeastOne = true
            spinnies.add(locators[i], {
              text: `Querying ${chalk.white(locators[i])}`,
            })
            peerCall(
              locators[i],
              'getSignerSideOrder',
              Object.assign(Object.assign(values, values2, { senderWallet: wallet.address })),
              'isValidOrder',
              (error, result) => {
                if (error) {
                  spinnies.fail(locators[i], { text: error })
                } else {
                  spinnies.succeed(locators[i], {
                    text:
                      'Order ' +
                      chalk.white(
                        `from ${chalk.underline(locators[i])} (get: ${chalk.bold(
                          result.signer.amount,
                        )}, price: ${chalk.bold(result.signer.amount / result.sender.amount)}, expiry: ${chalk.green(
                          new Date(result.expiry * 1000).toLocaleTimeString(),
                        )})`,
                      ),
                  })
                }
              },
            )
          }
        }
        if (!hasAtLeastOne) {
          console.log('\nNo peers found.\n')
        }
      })
    })
  },
}
