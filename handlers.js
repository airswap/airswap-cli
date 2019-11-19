const ethers = require('ethers')
const BigNumber = require('bignumber.js')
const { orders, signatures } = require('@airswap/order-utils')
const swapDeploys = require('@airswap/swap/deploys.json')

const constants = require('./constants.js')

// Specify the network to use (Mainnet or Rinkeby testnet)
const chainId = constants.chainsIds.RINKEBY

// Specify the Swap contract to use for settlement
const swapAddress = swapDeploys[chainId]
if (!swapAddress) throw new Error(`No Swap contract found for chain ID ${chainId}.`)
orders.setVerifyingContract(swapAddress)

// Import token pairs to quote for and their trade prices
const tokenPairs = require('./pairs.json')

// Default expiry to three minutes
const DEFAULT_EXPIRY = 180

// Only issue unique nonces every ten seconds
const DEFAULT_NONCE_WINDOW = 10

// The private key used to sign orders
let signerPrivateKey

// The public address for the private key
let signerWallet

// A maximum amount to send. Could be determined dynamically by balance
const maxSignerParam = 1000

// Get an expiry based on current time plus default expiry
function getExpiry() {
  return Math.round(new Date().getTime() / 1000) + DEFAULT_EXPIRY
}

// Get a nonce based on current time, unique per nonce window
function getNonce() {
  return Math.round(new Date().getTime() / 1000 / DEFAULT_NONCE_WINDOW)
}

// Determines whether serving quotes for a given token pair
function isTradingPair({ signerToken, senderToken }) {
  return signerToken in tokenPairs && senderToken in tokenPairs[signerToken]
}

// Calculates the senderParam: An amount the taker will send us in a sell
function priceSell({ signerParam, signerToken, senderToken }) {
  return BigNumber(signerParam)
    .multipliedBy(tokenPairs[signerToken][senderToken])
    .toFixed(0)
}

// Calculates the signerParam: An amount we would send the taker in a buy
function priceBuy({ senderParam, senderToken, signerToken }) {
  return BigNumber(senderParam)
    .dividedBy(tokenPairs[signerToken][senderToken])
    .toFixed(0)
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
    expiry: getExpiry(),
    nonce: getNonce(),
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

function initialize(_privateKey, _tradingFunctions) {
  if (!_privateKey) throw new Error('Private key is required')
  if (String(_privateKey).length !== 64) throw new Error('Private key should be 64 characters long')
  signerPrivateKey = Buffer.from(_privateKey, 'hex')
  signerWallet = new ethers.Wallet(signerPrivateKey).address

  // If provided, override default trading functions
  // priceBuy, priceSell, isTradingPair are required
  // getExpiry, getNonce are optional
  if (typeof _tradingFunctions === 'object') {
    // Override trading functions
    if (
      typeof _tradingFunctions.priceBuy === 'function' &&
      typeof _tradingFunctions.priceSell === 'function' &&
      typeof _tradingFunctions.isTradingPair === 'function'
    ) {
      priceBuy = _tradingFunctions.priceBuy
      priceSell = _tradingFunctions.priceSell
      isTradingPair = _tradingFunctions.isTradingPair

      // If provided, override expiry function
      if (typeof _tradingFunctions.getExpiry === 'function') {
        getExpiry = _tradingFunctions.getExpiry
      }

      // If provided, override nonce function
      if (typeof _tradingFunctions.getNonce === 'function') {
        getNonce = _tradingFunctions.getNonce
      }
    } else {
      throw new Error(
        'Either provide all required trading functions or none. Required: priceBuy, priceSell, isTradingPair; Optional: getExpiry, getNonce',
      )
    }
  }

  return handlers
}

module.exports = initialize
