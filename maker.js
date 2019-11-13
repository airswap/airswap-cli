/*
 * A simple maker for the AirSwap Network
 * Warning: For demonstration purposes only, use at your own risk
 */

const winston = require('winston')
const ethers = require('ethers')

const { orders, signatures } = require('@airswap/order-utils')
const swapDeploys = require('@airswap/swap/deploys.json')

// The token pairs we are serving quotes for and their trade prices
const tokenPairs = require('./pairs.json')

// Default expiry to three minutes
const DEFAULT_EXPIRY = 180

// Only issue unique nonces every ten seconds
const DEFAULT_NONCE_WINDOW = 10

// Logger instance
let logger

// The private key used to sign orders
let signerPrivateKey

// The public address for the private key
let signerWallet

// The Swap contract intended for settlement
let swapAddress

// A maximum amount to send. Could be determined dynamically by balance
const maxSignerParam = 1000

// Determine whether we're serving quotes for a given token pair
function isTradingPair({ signerToken, senderToken }) {
  return signerToken in tokenPairs && senderToken in tokenPairs[signerToken]
}

// Calculate the senderParam: An amount the taker will send us in a sell
function priceSell({ signerParam, signerToken, senderToken }) {
  return signerParam * tokenPairs[signerToken][senderToken]
}

// Calculate the signerParam: An amount we would send the taker in a buy
function priceBuy({ senderParam, senderToken, signerToken }) {
  return senderParam / tokenPairs[signerToken][senderToken]
}

// Create a quote object with the provided parameters
function createQuote({ signerToken, signerParam, senderToken, senderParam }) {
  return {
    signer: {
      token: signerToken,
      param: signerParam,
    },
    sender: {
      token: senderToken,
      param: senderParam,
    },
  }
}

// Create an order object with the provided parameters
async function createOrder({ signerToken, signerParam, senderWallet, senderToken, senderParam }) {
  const order = await orders.getOrder({
    expiry: Math.round(new Date().getTime() / 1000) + DEFAULT_EXPIRY,
    nonce: Math.round(new Date().getTime() / 1000 / DEFAULT_NONCE_WINDOW),
    signer: {
      wallet: signerWallet,
      token: signerToken,
      param: signerParam,
    },
    sender: {
      wallet: senderWallet,
      token: senderToken,
      param: senderParam,
    },
  })
  // Generate an order signature
  order.signature = signatures.getPrivateKeySignature(order, signerPrivateKey, swapAddress)
  return order
}

// Peer API Implementation
const handlers = {
  getSenderSideQuote: function(params, callback) {
    callback(
      null,
      createQuote({
        senderParam: priceSell(params),
        ...params,
      }),
    )
  },
  getSignerSideQuote: function(params, callback) {
    callback(
      null,
      createQuote({
        signerParam: priceBuy(params),
        ...params,
      }),
    )
  },
  getMaxQuote: function(params, callback) {
    callback(
      null,
      createQuote({
        signerParam: maxSignerParam,
        senderParam: priceSell({ signerParam: maxSignerParam, ...params }),
        ...params,
      }),
    )
  },
  getSenderSideOrder: async function(params, callback) {
    callback(
      null,
      await createOrder({
        senderParam: priceSell(params),
        ...params,
      }),
    )
  },
  getSignerSideOrder: async function(params, callback) {
    callback(
      null,
      await createOrder({
        signerParam: priceBuy(params),
        ...params,
      }),
    )
  },
}

let listener

// Configure and start the listener
exports.start = function(_listener, _signerPrivateKey, _chainId, _logLevel) {
  listener = _listener

  signerPrivateKey = Buffer.from(_signerPrivateKey, 'hex')
  signerWallet = new ethers.Wallet(signerPrivateKey).address
  swapAddress = swapDeploys[_chainId]

  if (!swapAddress) {
    throw Error(`No Swap contract found for chain ID ${_chainId}.`)
  } else {
    // Specify the Swap contract to use
    orders.setVerifyingContract(swapAddress)

    // Setup logger
    logger = winston.createLogger({
      level: _logLevel,
      transports: [new winston.transports.Console()],
      format: winston.format.printf(({ level, message }) => {
        return `${level}: ${message}`
      }),
    })

    listener.start(handlers, isTradingPair, logger)
  }
}

// Stops the transport
exports.stop = function(callback) {
  listener.stop(callback)
}
