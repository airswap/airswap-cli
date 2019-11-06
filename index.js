const dotenv = require('dotenv')
const server = require('./maker.js')
const constants = require('./scripts/constants.js')

// Load the .env file
dotenv.config()

if (!process.env.ETHEREUM_ACCOUNT) {
  throw Error('ETHEREUM_ACCOUNT must be set in your .env file.')
}

// Start the server
server.start(
  process.env.BIND_PORT,
  process.env.BIND_ADDRESS,
  process.env.ETHEREUM_ACCOUNT,
  constants.chainsIds.RINKEBY,
  'info'
)
