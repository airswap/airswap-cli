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

// Trading strategy handlers

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
  console.log('spk', signerPrivateKey)
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

function initHanlders(privateKey) {
  if (!privateKey) throw new Error('Must pass a privateKey to instantiate trade handlers')
  if (String(privateKey).length !== 64) throw new Error('privateKey should be exactly 64 characters')
  signerPrivateKey = Buffer.from(privateKey, 'hex')
  signerWallet = new ethers.Wallet(signerPrivateKey).address
  return handlers
}

module.exports = initHanlders
