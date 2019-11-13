const dotenv = require('dotenv')
const maker = require('./maker.js')
const server = require('./comms/web-express.js')
const constants = require('./scripts/constants.js')

// Load the .env file
dotenv.config()

if (!process.env.ETHEREUM_ACCOUNT) {
  throw Error('ETHEREUM_ACCOUNT must be set in your .env file.')
}

// Configure the server
server.configure(process.env.BIND_ADDRESS, process.env.BIND_PORT)

// Start the maker
maker.start(server, process.env.ETHEREUM_ACCOUNT, constants.chainsIds.RINKEBY, 'info')
