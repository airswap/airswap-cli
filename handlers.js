const ethers = require('ethers')
const BigNumber = require('bignumber.js')
const { orders, signatures } = require('@airswap/order-utils')
const swapDeploys = require('@airswap/swap/deploys.json')

const constants = require('./constants.js')
const orderConstants = require('@airswap/order-utils/src/constants.js')

BigNumber.config({ ERRORS: false })
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

// Specify the network to use (Mainnet or Rinkeby testnet)
const chainId = constants.chainIds.RINKEBY

// Specify the Swap contract to use for settlement
const swapAddress = swapDeploys[chainId]
if (!swapAddress) throw new Error(`No Swap contract found for chain ID ${chainId}.`)
orders.setVerifyingContract(swapAddress)

// Import token pairs to quote for and their trade prices
let tokenPrices = require('./token-prices.json')

// Import token amounts to use for maximums
let tokenAmounts = require('./token-amounts.json')

// Default expiry to three minutes
const DEFAULT_EXPIRY = 180

// Only issue unique nonces every ten seconds
const DEFAULT_NONCE_WINDOW = 10

// The private key used to sign orders
let signerPrivateKey

// The public address for the private key
let signerWallet
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
  return signerToken in tokenPrices && senderToken in tokenPrices[signerToken]
}

// Calculates the senderAmount: An amount the taker will send us in a sell
function priceSell({ signerAmount, signerToken, senderToken }) {
  return BigNumber(signerAmount)
    .multipliedBy(tokenPrices[signerToken][senderToken])
    .integerValue(BigNumber.ROUND_CEIL)
    .toString()
}

// Calculates the signerAmount: An amount we would send the taker in a buy
function priceBuy({ senderAmount, senderToken, signerToken }) {
  return BigNumber(senderAmount)
    .dividedBy(tokenPrices[signerToken][senderToken])
    .integerValue(BigNumber.ROUND_FLOOR)
    .toString()
}

// Get max param based on whether signerAmount or senderAmount is provided
function getMaxAmount(params) {
  if ('signerAmount' in params) {
    switch (params.signerToken) {
      case constants.rinkebyTokens.WETH:
        return BigNumber(tokenAmounts[constants.rinkebyTokens.WETH])
      case constants.rinkebyTokens.DAI:
        return BigNumber(tokenAmounts[constants.rinkebyTokens.DAI])
    }
  } else if ('senderAmount' in params) {
    switch (params.signerToken) {
      case constants.rinkebyTokens.DAI:
        return BigNumber(priceBuy({ signerAmount: tokenAmounts[constants.rinkebyTokens.DAI], ...params }))
      case constants.rinkebyTokens.WETH:
        return BigNumber(priceSell({ signerAmount: tokenAmounts[constants.rinkebyTokens.WETH], ...params }))
    }
  } else {
    throw new Error('Neither signerAmount or senderAmount provided to getMaxAmount')
  }
}

// Create a quote object with the provided parameters
function createQuote({ signerToken, signerAmount, senderToken, senderAmount }) {
  return {
    signer: {
      kind: orderConstants.ERC20_INTERFACE_ID,
      token: signerToken.toLowerCase(),
      amount: String(signerAmount),
      id: '0',
    },
    sender: {
      kind: orderConstants.ERC20_INTERFACE_ID,
      token: senderToken.toLowerCase(),
      amount: String(senderAmount),
      id: '0',
    },
  }
}

// Create an order object with the provided parameters
async function createOrder({ signerToken, signerAmount, senderWallet, senderToken, senderAmount }) {
  const order = await orders.getOrder({
    expiry: getExpiry(),
    nonce: getNonce(),
    signer: {
      wallet: signerWallet,
      token: signerToken,
      amount: signerAmount,
    },
    sender: {
      wallet: senderWallet,
      token: senderToken,
      amount: senderAmount,
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

// If above maximum amount return an error
function maxAmountGuard(proceed) {
  return function(params, callback) {
    if ('signerAmount' in params && getMaxAmount(params).lt(params.signerAmount)) {
      callback({
        code: -33603,
        message: `Maximum signerAmount is ${getMaxAmount(params)}`,
      })
    } else if ('senderAmount' in params && getMaxAmount(params).lt(params.senderAmount)) {
      callback({
        code: -33603,
        message: `Maximum senderAmount is ${getMaxAmount(params)}`,
      })
    } else {
      proceed(params, callback)
    }
  }
}

// Ensure a request has minimum required params
function hasParams(params, required) {
  for (var i = 0; i < required.length; i++) {
    if (typeof params[required[i]] !== 'string') {
      return false
    }
  }
  return true
}

// Peer API Implementation
const handlers = {
  getSenderSideQuote: tradingPairGuard(
    maxAmountGuard(function(params, callback) {
      const required = ['signerAmount', 'signerToken', 'senderToken']
      if (hasParams(params, required)) {
        callback(
          null,
          createQuote({
            senderAmount: priceSell(params),
            ...params,
          }),
        )
      } else {
        callback({
          code: -33604,
          message: `Require strings ${required.join(', ')}`,
        })
      }
    }),
  ),
  getSignerSideQuote: tradingPairGuard(
    maxAmountGuard(function(params, callback) {
      const required = ['senderAmount', 'senderToken', 'signerToken']
      if (hasParams(params, required)) {
        callback(
          null,
          createQuote({
            signerAmount: priceBuy(params),
            ...params,
          }),
        )
      } else {
        callback({
          code: -33604,
          message: `Require strings ${required.join(', ')}`,
        })
      }
    }),
  ),
  getMaxQuote: tradingPairGuard(function(params, callback) {
    const signerAmount = getMaxAmount({ signerAmount: params.signerAmount, signerToken: params.signerToken })
    const required = ['signerToken', 'senderToken']
    if (hasParams(params, required)) {
      callback(
        null,
        createQuote({
          signerAmount: signerAmount.toString(),
          senderAmount: priceSell({ signerAmount, ...params }),
          ...params,
        }),
      )
    } else {
      callback({
        code: -33604,
        message: `Require strings ${required.join(', ')}`,
      })
    }
  }),
  getSenderSideOrder: tradingPairGuard(
    maxAmountGuard(async function(params, callback) {
      const required = ['signerAmount', 'signerToken', 'senderWallet', 'senderToken']
      if (hasParams(params, required)) {
        callback(
          null,
          await createOrder({
            senderAmount: priceSell(params),
            ...params,
          }),
        )
      } else {
        callback({
          code: -33604,
          message: `Require strings ${required.join(', ')}`,
        })
      }
    }),
  ),
  getSignerSideOrder: tradingPairGuard(
    maxAmountGuard(async function(params, callback) {
      const required = ['senderAmount', 'senderToken', 'senderWallet', 'signerToken']
      if (hasParams(params, required)) {
        callback(
          null,
          await createOrder({
            signerAmount: priceBuy(params),
            ...params,
          }),
        )
      } else {
        callback({
          code: -33604,
          message: `Require strings ${required.join(', ')}`,
        })
      }
    }),
  ),
  ping: function(params, callback) {
    callback(null, 'pong')
  },
}

function initialize(_privateKey, _tokenPrices, _tokenAmounts, _tradingFunctions) {
  if (!_privateKey) throw new Error('Private key is required')
  if (String(_privateKey).length !== 64) throw new Error('Private key should be 64 characters long')
  signerPrivateKey = Buffer.from(_privateKey, 'hex')
  signerWallet = new ethers.Wallet(signerPrivateKey).address

  // If provided, override default trading functions
  // isTradingPair, priceBuy, priceSell, getMaxAmount are required
  // getExpiry, getNonce are optional
  if (typeof _tradingFunctions === 'object') {
    // Override trading functions
    if (
      typeof _tradingFunctions.isTradingPair === 'function' &&
      typeof _tradingFunctions.priceBuy === 'function' &&
      typeof _tradingFunctions.priceSell === 'function' &&
      typeof _tradingFunctions.getMaxAmount === 'function'
    ) {
      priceBuy = _tradingFunctions.priceBuy
      priceSell = _tradingFunctions.priceSell
      isTradingPair = _tradingFunctions.isTradingPair
      getMaxAmount = _tradingFunctions.getMaxAmount

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

  // If provided, override the price and amount values
  if (typeof _tokenPrices === 'object') {
    if (typeof _tokenAmounts === 'object') {
      tokenPrices = _tokenPrices
      tokenAmounts = _tokenAmounts
    } else {
      throw new Error('Either provide both tokenPrices and tokenAmounts or neither')
    }
  }

  return handlers
}

module.exports = initialize
