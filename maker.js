/*
 * A simple maker for the AirSwap Network
 * Warning: For demonstration purposes only, use at your own risk
 */

const winston = require('winston')
const ethers = require('ethers')

const { orders, signatures } = require('@airswap/order-utils')
const swapDeploys = require('@airswap/swap/deploys.json')

// Default expiry to three minutes
const DEFAULT_EXPIRY = 180

// Only issue unique nonces every ten seconds
const DEFAULT_NONCE_WINDOW = 10

// Server instance
let server

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

// Trading strategy handlers
let isTradingPair
let priceBuy
let priceSell

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

// If not trading a requested pair return an error
function tradingPairGuard(proceed) {
  return function(params, callback) {
    if (isTradingPair(params) && typeof priceBuy === 'function' && typeof priceSell === 'function') {
      proceed(params, callback)
    } else {
      callback({
        code: -33601,
        message: 'Not serving quotes for this token pair',
      })
    }
  }
}

// Peer API Implementation
const handlers = {
  getSenderSideQuote: tradingPairGuard(function(params, callback) {
    callback(
      null,
      createQuote({
        senderParam: priceSell(params),
        ...params,
      }),
    )
  }),
  getSignerSideQuote: tradingPairGuard(function(params, callback) {
    callback(
      null,
      createQuote({
        signerParam: priceBuy(params),
        ...params,
      }),
    )
  }),
  getMaxQuote: tradingPairGuard(function(params, callback) {
    callback(
      null,
      createQuote({
        signerParam: maxSignerParam,
        senderParam: priceSell({ signerParam: maxSignerParam, ...params }),
        ...params,
      }),
    )
  }),
  getSenderSideOrder: tradingPairGuard(async function(params, callback) {
    callback(
      null,
      await createOrder({
        senderParam: priceSell(params),
        ...params,
      }),
    )
  }),
  getSignerSideOrder: tradingPairGuard(async function(params, callback) {
    callback(
      null,
      await createOrder({
        signerParam: priceBuy(params),
        ...params,
      }),
    )
  }),
}

// Configure and start the server
exports.start = function(_server, _signerPrivateKey, _chainId, _isTradingPair, _priceBuy, _priceSell, _logLevel) {
  swapAddress = swapDeploys[_chainId]

  if (!swapAddress) {
    throw Error(`No Swap contract found for chain ID ${_chainId}.`)
  } else {
    server = _server
    signerPrivateKey = Buffer.from(_signerPrivateKey, 'hex')
    signerWallet = new ethers.Wallet(signerPrivateKey).address

    isTradingPair = _isTradingPair
    priceBuy = _priceBuy
    priceSell = _priceSell

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

    server.start(handlers, logger)
  }
}

// Stops the transport
exports.stop = function(callback) {
  server.stop(callback)
}
