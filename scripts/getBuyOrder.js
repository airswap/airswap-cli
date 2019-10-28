const jayson = require('jayson')
const chalk = require('chalk')
const network = require('./lib/network.js')
const prompt = require('./lib/prompt.js')
const { orders } = require('@airswap/order-utils')

const fields = {
  locator: {
    description: chalk.white.bold('Locator to query'),
    type: 'URL',
    default: 'http://localhost:8000',
  },
  amount: {
    description: `${chalk.white.bold('Amount')} to buy`,
    type: 'Number',
    default: 100,
  },
  signerToken: {
    description: `${chalk.white.bold('Token')} to buy`,
    type: 'Address',
    default: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
  },
  senderToken: {
    description: `${chalk.white.bold('Token')} to spend`,
    type: 'Address',
    default: '0xc778417e063141139fce010982780140aa0cd5ab',
  },
}

network.select('Buy a Token', wallet => {
  prompt.get(fields, values => {
    const client = jayson.client.http(values.locator)
    client.request(
      'getSenderSideOrder',
      {
        signerParam: values.amount,
        signerToken: values.signerToken,
        senderWallet: wallet.address,
        senderToken: values.senderToken,
      },
      function(err, error, order) {
        if (err) {
          console.log(`\r\n${chalk.yellow('HTTP Error')}: ${err.message}\r\n`)
        } else {
          if (error) {
            console.log(`\r\n${chalk.yellow('Maker Error')}: ${error.message}\r\n`)
          } else if (!orders.isValidOrder(order)) {
            console.log(`\r\n${chalk.yellow('Got a Malformed Quote')}`)
            console.log(order)
          } else {
            const values = {
              buying: `${chalk.green(order.signer.param)} ${chalk.white.bold(order.signer.token)}`,
              cost: `${chalk.green(order.sender.param)} ${chalk.white.bold(order.sender.token)}`,
              price: `${chalk.green(order.sender.param / order.signer.param)}`,
              expires: `${new Date(order.expiry * 1000).toLocaleTimeString()}`,
            }
            prompt.confirm('Got an Order', 'take this order', values, () => {
              console.log('Yes')
            })
          }
        }
      }
    )
  })
})
