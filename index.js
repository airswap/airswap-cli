const dotenv = require('dotenv')
const BigNumber = require('bignumber.js')
const maker = require('./maker.js')
const server = require('./comms/web-express.js')
const constants = require('./scripts/constants.js')

// Load the .env file
dotenv.config()

if (!process.env.ETHEREUM_ACCOUNT) {
  throw Error('ETHEREUM_ACCOUNT must be set in your .env file.')
}

// Import token pairs to quote for and their trade prices
const tokenPairs = require('./pairs.json')

// Determines whether serving quotes for a given token pair
function isTradingPair({ signerToken, senderToken }) {
  return signerToken in tokenPairs && senderToken in tokenPairs[signerToken]
}

// Calculates the senderParam: An amount the taker will send us in a sell
function priceSell({ signerParam, signerToken, senderToken }) {
  return BigNumber(signerParam)
    .multipliedBy(tokenPairs[signerToken][senderToken])
    .toFixed()
}

// Calculates the signerParam: An amount we would send the taker in a buy
function priceBuy({ senderParam, senderToken, signerToken }) {
  return BigNumber(senderParam)
    .dividedBy(tokenPairs[signerToken][senderToken])
    .toFixed()
}

// Configure the server
server.configure(process.env.BIND_ADDRESS, process.env.BIND_PORT)

// Start the maker
maker.start(
  server,
  process.env.ETHEREUM_ACCOUNT,
  constants.chainsIds.RINKEBY,
  isTradingPair,
  priceBuy,
  priceSell,
  'info',
)
