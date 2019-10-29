const dotenv = require('dotenv')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt')
const chalk = require('chalk')

const {
  getBuyQuote,
  getBuyQuoteAll,
  getSellQuote,
  getSellQuoteAll,
  getBuyOrder,
  getBuyOrderAll,
  getSellOrder,
  getSellOrderAll,
} = require('./handlers')

dotenv.config()

const fields = {
  kind: {
    description: `${chalk.white('Select a kind')} ${chalk.gray('(quote, order)')}`,
    default: 'quote',
    kind: 'String',
  },
  side: {
    description: `${chalk.white('Select a side')} ${chalk.gray('(buy, sell)')}`,
    default: 'buy',
    kind: 'String',
  },
  locator: {
    description: `${chalk.white('Query a locator')} ${chalk.gray('(optional)')}`,
    kind: 'String',
    optional: true,
  },
}

network.select('Query Peers', wallet => {
  prompt.get(fields, result => {
    if (result.kind === 'quote') {
      if (result.side === 'buy') {
        if (result.locator) {
          getBuyQuote(wallet, result.locator)
        } else {
          getBuyQuoteAll(wallet)
        }
      } else {
        if (result.locator) {
          getSellQuote(wallet, result.locator)
        } else {
          getSellQuoteAll(wallet)
        }
      }
    } else {
      if (result.side === 'buy') {
        if (result.locator) {
          getBuyOrder(wallet, result.locator)
        } else {
          getBuyOrderAll(wallet)
        }
      } else {
        if (result.locator) {
          getSellOrder(wallet, result.locator)
        } else {
          getSellOrderAll(wallet)
        }
      }
    }
  })
})
