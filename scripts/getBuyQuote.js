const jayson = require('jayson')
const chalk = require('chalk')
const prompt = require('./lib/prompt.js')

const { orders } = require('@airswap/order-utils')

const fields = {
  locator: {
    description: chalk.white.bold('Locator to query'),
    type: 'URL',
    default: 'http://localhost:8000',
  },
  amount: {
    description: `${chalk.white.bold('Amount')} of token to buy`,
    type: 'Number',
    default: 100,
  },
  signerToken: {
    description: `${chalk.white.bold('Address')} of token to buy`,
    type: 'Address',
    default: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
  },
  senderToken: {
    description: `${chalk.white.bold('Address')} of token to spend`,
    type: 'Address',
    default: '0xc778417e063141139fce010982780140aa0cd5ab',
  },
}

console.log()
console.log(`${chalk.white.bold('AirSwap')}: Get a Quote`)
console.log()

prompt.get(fields, values => {
  const client = jayson.client.http(values.locator)
  client.request(
    'getSenderSideQuote',
    {
      signerParam: values.amount,
      signerToken: values.signerToken,
      senderToken: values.senderToken,
    },
    function(err, error, quote) {
      if (err) {
        console.log(`\r\n${chalk.yellow('HTTP Error')}: ${err.message}\r\n`)
      } else {
        if (error) {
          console.log(`\r\n${chalk.yellow('Maker Error')}: ${error.message}\r\n`)
        } else if (!orders.isValidQuote(quote)) {
          console.log(`\r\n${chalk.yellow('Got a Malformed Quote')}`)
          console.log(quote)
        } else {
          console.log(chalk.underline(`\r\n${chalk.white.bold('Got a Quote')}\r\n`))
          console.log(`Buying ${chalk.green(quote.signer.param)} ${chalk.white.bold(quote.signer.token)}`)
          console.log(`Cost   ${chalk.green(quote.sender.param)} ${chalk.white.bold(quote.sender.token)}`)
          console.log(`Price  ${chalk.green(quote.sender.param / quote.signer.param)}`)
          console.log()
        }
      }
    }
  )
})
